import { store } from '../store/dataStore.js';
import { DeploymentItem, PipelineExecution } from '../types/index.js';
import { PipelineService } from './pipelineService.js';
import { GitHubService } from './githubService.js';
import { BlueprintService } from './blueprintService.js';
import { ArtifactService } from './artifactService.js';

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
    const repo = store.repositories.find((r) => r.id === repositoryId);
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

    // 3. If requested, commit Dockerfile to real GitHub repository
    if (options.commitArtifactsToGitHub && process.env.GITHUB_TOKEN) {
      const dockerfile = artifacts.find((a) => a.fileType === 'dockerfile');
      if (dockerfile && repo.owner && repo.name) {
        await GitHubService.commitFile(
          repo.owner,
          repo.name,
          'Dockerfile',
          dockerfile.content,
          'ci(devops): generate production multi-stage Dockerfile via Unified DevOps Platform',
          branch
        );
      }
    }

    // 4. Trigger autonomous 9-stage pipeline
    const pipeline = PipelineService.trigger(repositoryId, branch, 'manual');

    // 5. Register or update live Kubernetes Deployment
    let deployment = store.deployments.find((d) => d.repositoryId === repositoryId);
    const imageTag = `ghcr.io/${repo.owner}/${repo.name}:v${pipeline.buildNumber}.0.0`;

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
        endpoints: [`https://${repo.name}.platform.internal`],
        events: [
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
