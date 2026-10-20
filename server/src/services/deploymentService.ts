import { store } from '../store/dataStore.js';
import { DeploymentItem } from '../types/index.js';

export class DeploymentService {
  public static getAll(): DeploymentItem[] {
    return store.deployments;
  }

  public static getByRepoId(repoId: string): DeploymentItem[] {
    return store.deployments.filter((d) => d.repositoryId === repoId);
  }

  public static scale(deploymentId: string, replicas: number): DeploymentItem {
    const dep = store.deployments.find((d) => d.id === deploymentId);
    if (!dep) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    const prev = dep.replicas.desired;
    dep.replicas.desired = replicas;
    dep.replicas.ready = replicas;

    dep.events.unshift({
      timestamp: new Date().toISOString(),
      type: 'Normal',
      reason: 'ScalingReplicaSet',
      message: `Scaled deployment ${dep.repositoryName} from ${prev} to ${replicas} replicas.`,
    });

    return dep;
  }

  public static rollback(deploymentId: string): DeploymentItem {
    const dep = store.deployments.find((d) => d.id === deploymentId);
    if (!dep) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    const prevTag = dep.imageTag;
    dep.imageTag = `v${Math.max(1, parseInt(dep.imageTag.replace(/\D/g, '') || '1', 10) - 1)}.0.0-rollback`;
    dep.deployedAt = new Date().toISOString();

    dep.events.unshift({
      timestamp: new Date().toISOString(),
      type: 'Normal',
      reason: 'RollbackTriggered',
      message: `Rollback triggered from ${prevTag} to stable release ${dep.imageTag}.`,
    });

    return dep;
  }
}
