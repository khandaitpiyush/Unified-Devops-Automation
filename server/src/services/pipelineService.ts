import { store } from '../store/dataStore.js';
import { PipelineExecution, PipelineStage } from '../types/index.js';

export class PipelineService {
  public static getAll(): PipelineExecution[] {
    return store.pipelines;
  }

  public static getById(id: string): PipelineExecution | null {
    return store.pipelines.find((p) => p.id === id) || null;
  }

  public static trigger(repoId: string, branch: string = 'main', triggerSource: 'manual' | 'github_push' | 'webhook' = 'manual'): PipelineExecution {
    const repo = store.repositories.find((r) => r.id === repoId);
    const repoName = repo ? repo.name : 'devops-app';
    const nextBuildNum = store.pipelines.length + 43;

    const stages: PipelineStage[] = [
      { id: 'stg-1', name: 'Checkout Source', order: 1, status: 'success', durationSeconds: 4, logs: ['Cloned git repository', `Ref: ${branch}`] },
      { id: 'stg-2', name: 'Install Dependencies', order: 2, status: 'running', durationSeconds: 7, logs: ['Restoring dependencies with npm ci...'] },
      { id: 'stg-3', name: 'Run Tests & Lint', order: 3, status: 'pending' },
      { id: 'stg-4', name: 'SonarQube Quality Gate', order: 4, status: 'pending' },
      { id: 'stg-5', name: 'Trivy Security Scan', order: 5, status: 'pending' },
      { id: 'stg-6', name: 'Build Docker Image', order: 6, status: 'pending' },
      { id: 'stg-7', name: 'Push Image to GHCR', order: 7, status: 'pending' },
      { id: 'stg-8', name: 'Deploy to Kubernetes', order: 8, status: 'pending' },
      { id: 'stg-9', name: 'Record Telemetry', order: 9, status: 'pending' },
    ];

    const commitSha = Math.random().toString(16).substring(2, 9);
    const newExec: PipelineExecution = {
      id: `pipe-exec-${nextBuildNum}`,
      repositoryId: repoId,
      repositoryName: repoName,
      branch,
      commitSha,
      commitMessage: `chore(ci): automated release build #${nextBuildNum}`,
      buildNumber: nextBuildNum,
      triggerSource,
      startTime: new Date().toISOString(),
      durationSeconds: 12,
      status: 'running',
      stages,
      testResults: { passed: 48, failed: 0, skipped: 0, total: 48, coveragePercent: 94.2 },
      qualityGate: { status: 'passed', bugs: 0, vulnerabilities: 0, codeSmells: 2 },
      securityScan: { critical: 0, high: 0, medium: 1, low: 3, blockedDeployment: false },
      imageArtifact: {
        imageTag: `ghcr.io/khandaitpiyush/${repoName}:v${nextBuildNum}.0.0`,
        registry: 'ghcr.io',
        digest: `sha256:${commitSha}...`,
      },
      deploymentOutcome: { environment: 'production', namespace: 'production', status: 'deployed' },
    };

    store.pipelines.unshift(newExec);

    if (repo) {
      repo.latestPipelineStatus = 'running';
    }

    // Progress pipeline to success asynchronously
    setTimeout(() => {
      newExec.status = 'success';
      newExec.durationSeconds = 51;
      newExec.stages.forEach((s) => {
        s.status = 'success';
        s.durationSeconds = Math.floor(Math.random() * 8) + 3;
      });
      if (repo) {
        repo.latestPipelineStatus = 'success';
      }

      // Update deployment imageTag if deployment exists
      const dep = store.deployments.find((d) => d.repositoryId === repoId);
      if (dep) {
        dep.imageTag = newExec.imageArtifact?.imageTag || dep.imageTag;
        dep.deployedAt = new Date().toISOString();
        dep.events.unshift({
          timestamp: new Date().toISOString(),
          type: 'Normal',
          reason: 'RollingUpdateCompleted',
          message: `Successfully rolled out build #${nextBuildNum} to ${dep.replicas.ready} pods.`,
        });
      }
    }, 4000);

    return newExec;
  }

  public static abort(id: string): PipelineExecution | null {
    const pipe = store.pipelines.find((p) => p.id === id);
    if (!pipe) return null;
    pipe.status = 'aborted';
    return pipe;
  }
}
