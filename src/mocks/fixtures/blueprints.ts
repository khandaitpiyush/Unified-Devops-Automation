import { DevOpsBlueprint } from '@/types';

export const mockBlueprints: DevOpsBlueprint[] = [
  {
    id: 'bp-unified-v1',
    repositoryId: 'repo-unified-devops',
    repositoryName: 'unified-devops-automation',
    version: 'v1.0.0',
    status: 'approved',
    createdAt: '2026-10-18T10:30:00Z',
    approvedAt: '2026-10-18T10:45:00Z',
    approvedBy: 'lead-devops-eng@org.internal',
    stack: 'React 18 + Vite + TypeScript',
    deploymentTarget: 'Kubernetes (Azure AKS / Production)',
    config: {
      app: {
        name: 'unified-devops-web',
        port: 3000,
        envVars: {
          NODE_ENV: 'production',
          PORT: '3000',
        },
      },
      build: {
        tool: 'npm',
        command: 'npm ci && npm run build',
        artifactDir: 'dist',
      },
      test: {
        command: 'npm run lint',
        requiredPassing: true,
      },
      container: {
        baseImage: 'node:22-alpine',
        targetPort: 3000,
        context: '.',
        multistage: true,
      },
      registry: {
        target: 'ghcr.io',
        repository: 'khandaitpiyush/unified-devops-automation',
        tagPattern: '${GIT_COMMIT_SHORT}-${BUILD_NUMBER}',
      },
      security: {
        sonarqube: {
          enabled: true,
          projectKey: 'devops-automation-web',
          qualityGate: 'Strict-Enterprise-Gate',
        },
        trivy: {
          enabled: true,
          severityThreshold: 'HIGH',
          failOnSeverity: true,
        },
      },
      deployment: {
        type: 'kubernetes',
        namespace: 'devops-control-plane',
        replicas: 3,
        serviceType: 'LoadBalancer',
        resources: {
          cpu: '250m - 500m',
          memory: '512Mi - 1Gi',
        },
      },
      infrastructure: {
        provider: 'azure',
        managedResources: [
          'azurerm_resource_group.rg_devops',
          'azurerm_kubernetes_cluster.aks_devops',
          'azurerm_container_registry.ghcr_link',
        ],
      },
      observability: {
        prometheusScrape: true,
        prometheusPort: 3000,
        grafanaDashboard: 'devops-platform-overview',
      },
    },
    assumptions: [
      'Vite build output directory is set to standard "dist".',
      'GHCR credentials are provided in Jenkins credentials manager under GHCR_CREDENTIALS_ID.',
      'Kubernetes cluster has ingress controller and cert-manager configured.',
    ],
    warnings: [
      'Replicas set to 3. Verify horizontal pod autoscaler thresholds before peak production load.',
    ],
  },
  {
    id: 'bp-payments-draft',
    repositoryId: 'repo-payments-api',
    repositoryName: 'payment-processing-service',
    version: 'v1.1.0-draft',
    status: 'pending_approval',
    createdAt: '2026-10-18T12:00:00Z',
    stack: 'Java 21 + Spring Boot 3.2',
    deploymentTarget: 'Kubernetes (Azure AKS / Staging)',
    config: {
      app: {
        name: 'payment-service',
        port: 8080,
        envVars: {
          SPRING_PROFILES_ACTIVE: 'staging',
          SERVER_PORT: '8080',
        },
      },
      build: {
        tool: 'maven',
        command: 'mvn clean package -DskipTests=false',
        artifactDir: 'target',
      },
      test: {
        command: 'mvn test',
        requiredPassing: true,
      },
      container: {
        baseImage: 'eclipse-temurin:21-jre-alpine',
        targetPort: 8080,
        context: '.',
        multistage: true,
      },
      registry: {
        target: 'ghcr.io',
        repository: 'enterprise-org/payment-processing-service',
        tagPattern: 'sha-${GIT_COMMIT_SHORT}',
      },
      security: {
        sonarqube: {
          enabled: true,
          projectKey: 'payment-processing-service',
          qualityGate: 'Banking-PCI-Gate',
        },
        trivy: {
          enabled: true,
          severityThreshold: 'CRITICAL',
          failOnSeverity: true,
        },
      },
      deployment: {
        type: 'kubernetes',
        namespace: 'payments-staging',
        replicas: 2,
        serviceType: 'ClusterIP',
        resources: {
          cpu: '500m - 1000m',
          memory: '1Gi - 2Gi',
        },
      },
      infrastructure: {
        provider: 'azure',
        managedResources: ['azurerm_kubernetes_cluster.aks_devops'],
      },
      observability: {
        prometheusScrape: true,
        prometheusPort: 8080,
        grafanaDashboard: 'payments-microservice-metrics',
      },
    },
    assumptions: [
      'Database connection secrets are securely fetched via Kubernetes External Secrets Operator or HashiCorp Vault.',
    ],
    warnings: [
      'Requires human DevOps review and approval before generating Jenkinsfile and Kubernetes manifests.',
    ],
  },
];
