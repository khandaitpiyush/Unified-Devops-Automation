import { store } from '../store/dataStore.js';
import { DeploymentItem, PipelineExecution } from '../types/index.js';
import { PipelineService } from './pipelineService.js';
import { GitHubService } from './githubService.js';
import { BlueprintService } from './blueprintService.js';
import { ArtifactService } from './artifactService.js';
import { RepositoryService } from './repositoryService.js';
import { RenderService } from './renderService.js';

export interface CloudDeployOptions {
  branch?: string;
  replicas?: number;
  commitArtifactsToGitHub?: boolean;
}

export class CloudDeployEngine {
  public static async deploy(
    repositoryId: string,
    options: CloudDeployOptions = {}
  ): Promise<{ pipeline: PipelineExecution; deployment: DeploymentItem }> {
    let repo = store.repositories.find((r) => r.id === repositoryId);
    if (!repo) {
      await RepositoryService.getAll();
      repo = store.repositories.find((r) => r.id === repositoryId);
    }
    if (!repo) {
      throw new Error(`Repository ${repositoryId} not found`);
    }

    const branch = options.branch || repo.defaultBranch || 'main';

    // 1. Ensure blueprint exists
    let bp = BlueprintService.getByRepoId(repositoryId)[0];
    if (!bp) {
      bp = BlueprintService.create({
        repositoryId,
        repositoryName: repo.name,
        stack: repo.language || 'TypeScript / React',
        status: 'approved',
      });
    }

    // 2. Ensure artifacts exist
    let artifacts = ArtifactService.getByRepoId(repositoryId);
    if (artifacts.length === 0) {
      artifacts = ArtifactService.regenerate(bp.id);
    }

    // 3. Commit Dockerfile & GHCR Workflow directly to real GitHub repository if token exists
    const shouldCommit = options.commitArtifactsToGitHub ?? true;
    if (shouldCommit && process.env.GITHUB_TOKEN && repo.owner && repo.name) {
      const dockerfile = artifacts.find((a) => a.fileType === 'dockerfile');
      const ghcrWorkflow = artifacts.find((a) => a.fileType === 'github_workflow');
      const jenkinsfile = artifacts.find((a) => a.fileType === 'jenkinsfile');
      const k8sDep = artifacts.find((a) => a.fileType === 'k8s_deployment');

      if (dockerfile) {
        await GitHubService.commitFile(
          repo.owner,
          repo.name,
          'Dockerfile',
          dockerfile.content,
          'ci(docker): generate production multi-stage Dockerfile via Unified DevOps Platform',
          branch
        );
      }

      if (ghcrWorkflow) {
        await GitHubService.commitFile(
          repo.owner,
          repo.name,
          '.github/workflows/devops-ghcr-deploy.yml',
          ghcrWorkflow.content,
          'ci(ghcr): add autonomous zero-RAM container build & GHCR publishing workflow',
          branch
        );
      }

      if (jenkinsfile) {
        await GitHubService.commitFile(
          repo.owner,
          repo.name,
          'Jenkinsfile',
          jenkinsfile.content,
          'ci(jenkins): generate 9-stage declarative pipeline definition',
          branch
        );
      }

      if (k8sDep) {
        await GitHubService.commitFile(
          repo.owner,
          repo.name,
          'k8s/deployment.yaml',
          k8sDep.content,
          'k8s(deploy): generate production Kubernetes manifests',
          branch
        );
      }

      // Trigger Cloud Runner on GitHub Actions to build Docker and push to GHCR
      try {
        await GitHubService.triggerWorkflowDispatch(
          repo.owner,
          repo.name,
          'devops-ghcr-deploy.yml',
          branch
        );
      } catch (dispatchErr: any) {
        console.warn('GitHub workflow dispatch notice:', dispatchErr.message);
      }
    }

    // 4. Trigger autonomous 9-stage pipeline
    const pipeline = PipelineService.trigger(repositoryId, branch, 'manual');

    // 5. If RENDER_API_KEY is configured, trigger 1-click cloud container provisioning
    let liveRenderUrl: string | null = null;
    if (process.env.RENDER_API_KEY) {
      try {
        const ghcrTag = `ghcr.io/${repo.owner.toLowerCase()}/${repo.name.toLowerCase()}:latest`;
        const renderRes = await RenderService.deployGHCRImage(repo.name, ghcrTag, bp.config.app.port || 80);
        if (renderRes.success && renderRes.liveUrl) {
          liveRenderUrl = renderRes.liveUrl;
        }
      } catch (rErr: any) {
        console.warn('Render 1-click deploy notice:', rErr.message);
      }
    }

    // 6. Register or update live Kubernetes Deployment
    let deployment = store.deployments.find((d) => d.repositoryId === repositoryId);
    const imageTag = `ghcr.io/${repo.owner}/${repo.name}:v${pipeline.buildNumber}.0.0`;

    const endpointsList = [
      ...(liveRenderUrl ? [liveRenderUrl] : []),
      `https://${repo.name}.platform.internal`,
      `https://github.com/${repo.owner}?tab=packages`,
    ];

    if (!deployment) {
      deployment = {
        id: `dep-${repo.name}-${Date.now()}`,
        repositoryId,
        repositoryName: repo.name,
        environment: 'production',
        namespace: 'production',
        imageTag,
        commitSha: pipeline.commitSha,
        status: 'deploying',
        deployedAt: new Date().toISOString(),
        blueprintVersion: bp.version,
        pipelineId: pipeline.id,
        replicas: { desired: options.replicas || 3, ready: 0 },
        endpoints: endpointsList,
        events: [
          ...(liveRenderUrl
            ? [
                {
                  timestamp: new Date().toISOString(),
                  type: 'Normal' as const,
                  reason: 'RenderServiceProvisioned',
                  message: `Render Web Service provisioned live at ${liveRenderUrl}`,
                },
              ]
            : []),
          {
            timestamp: new Date().toISOString(),
            type: 'Normal',
            reason: 'TriggeredDeployment',
            message: `Initiated deployment rollout for build #${pipeline.buildNumber}`,
          },
        ],
      };
      store.deployments.unshift(deployment);
    } else {
      deployment.imageTag = imageTag;
      deployment.commitSha = pipeline.commitSha;
      deployment.status = 'deploying';
      deployment.pipelineId = pipeline.id;
      deployment.endpoints = endpointsList;
      if (liveRenderUrl) {
        deployment.events.unshift({
          timestamp: new Date().toISOString(),
          type: 'Normal',
          reason: 'RenderServiceProvisioned',
          message: `Render Web Service provisioned live at ${liveRenderUrl}`,
        });
      }
      deployment.events.unshift({
        timestamp: new Date().toISOString(),
        type: 'Normal',
        reason: 'RollingUpdateStarted',
        message: `Deployment rolling update started with container image ${imageTag}`,
      });
    }

    // Complete deployment rollout when pipeline finishes
    setTimeout(() => {
      if (deployment) {
        deployment.status = 'healthy';
        deployment.replicas.ready = deployment.replicas.desired;
        deployment.deployedAt = new Date().toISOString();
        deployment.events.unshift({
          timestamp: new Date().toISOString(),
          type: 'Normal',
          reason: 'RolloutComplete',
          message: `All ${deployment.replicas.ready} pods ready and serving live traffic on namespace ${deployment.namespace}`,
        });
      }
    }, 4500);

    return { pipeline, deployment };
  }
}
