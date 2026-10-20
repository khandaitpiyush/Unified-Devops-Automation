import { store } from '../store/dataStore.js';
import { DevOpsBlueprint } from '../types/index.js';
import { ArtifactGenerator } from '../generators/artifactGenerator.js';

export class BlueprintService {
  public static getAll(): DevOpsBlueprint[] {
    return store.blueprints;
  }

  public static getById(id: string): DevOpsBlueprint | null {
    return store.blueprints.find((b) => b.id === id) || null;
  }

  public static getByRepoId(repoId: string): DevOpsBlueprint[] {
    return store.blueprints.filter((b) => b.repositoryId === repoId);
  }

  public static create(data: Partial<DevOpsBlueprint>): DevOpsBlueprint {
    const repo = store.repositories.find((r) => r.id === data.repositoryId);
    const newBp: DevOpsBlueprint = {
      id: `bp-${Date.now()}`,
      repositoryId: data.repositoryId || 'repo-unified-devops',
      repositoryName: data.repositoryName || repo?.name || 'app',
      version: data.version || 'v1.0.0',
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      stack: data.stack || repo?.language || 'React + Node.js 22',
      deploymentTarget: data.deploymentTarget || 'Azure Kubernetes Service (AKS)',
      config: data.config || {
        app: {
          name: repo?.name || 'app',
          port: 80,
          envVars: {},
        },
        build: {
          tool: 'npm',
          command: 'npm run build',
          artifactDir: 'dist',
        },
        test: {
          command: 'npm run lint && npm test',
          requiredPassing: true,
        },
        container: {
          baseImage: 'node:22-alpine',
          targetPort: 80,
          context: '.',
          multistage: true,
        },
        registry: {
          target: 'ghcr.io/khandaitpiyush',
          repository: repo?.name || 'app',
          tagPattern: '${BUILD_NUMBER}',
        },
        security: {
          sonarqube: {
            enabled: true,
            projectKey: repo?.name || 'app',
            qualityGate: 'PASSED',
          },
          trivy: {
            enabled: true,
            severityThreshold: 'CRITICAL',
            failOnSeverity: true,
          },
        },
        deployment: {
          type: 'kubernetes',
          namespace: 'production',
          replicas: 3,
          serviceType: 'ClusterIP',
          resources: {
            cpu: '500m',
            memory: '512Mi',
          },
        },
        infrastructure: {
          provider: 'azure',
          managedResources: ['azurerm_kubernetes_cluster.aks'],
        },
        observability: {
          prometheusScrape: true,
          prometheusPort: 80,
          grafanaDashboard: 'k8s-workloads',
        },
      },
      assumptions: data.assumptions || ['Derived from automated repository analysis fingerprint.'],
      warnings: data.warnings || [],
    };

    store.blueprints.unshift(newBp);
    if (repo) {
      repo.blueprintStatus = 'pending_approval';
    }

    return newBp;
  }

  public static approve(blueprintId: string, approvedBy: string = 'Piyush Khandait'): DevOpsBlueprint {
    const bp = store.blueprints.find((b) => b.id === blueprintId);
    if (!bp) {
      throw new Error(`Blueprint ${blueprintId} not found`);
    }

    bp.status = 'approved';
    bp.approvedAt = new Date().toISOString();
    bp.approvedBy = approvedBy;

    // Generate or update manifests from approved blueprint
    const generated = ArtifactGenerator.generateAll(bp);
    // Remove old artifacts for this blueprint
    store.artifacts = store.artifacts.filter((a) => a.blueprintId !== blueprintId);
    store.artifacts.push(...generated);

    // Update repository blueprint status
    const repo = store.repositories.find((r) => r.id === bp.repositoryId);
    if (repo) {
      repo.blueprintStatus = 'approved';
    }

    return bp;
  }
}
