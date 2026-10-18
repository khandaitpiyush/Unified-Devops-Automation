import { DeploymentItem } from '@/types';

export const mockDeployments: DeploymentItem[] = [
  {
    id: 'dep-unified-prod-01',
    repositoryId: 'repo-unified-devops',
    repositoryName: 'unified-devops-automation',
    environment: 'production',
    namespace: 'devops-control-plane',
    imageTag: 'b3f939e-42',
    commitSha: 'b3f939e',
    status: 'healthy',
    deployedAt: '2026-10-18T10:55:00Z',
    blueprintVersion: 'v1.0.0',
    pipelineId: 'pipe-exec-42',
    replicas: {
      desired: 3,
      ready: 3,
    },
    endpoints: ['https://devops.platform.internal', '20.52.180.12:80'],
    events: [
      {
        timestamp: '2026-10-18T10:55:12Z',
        type: 'Normal',
        reason: 'ScalingReplicaSet',
        message: 'Scaled up replica set unified-devops-web-74b8f8d99c to 3',
      },
      {
        timestamp: '2026-10-18T10:55:25Z',
        type: 'Normal',
        reason: 'Pulled',
        message: 'Container image "ghcr.io/khandaitpiyush/unified-devops-automation:b3f939e-42" already present on machine',
      },
      {
        timestamp: '2026-10-18T10:55:38Z',
        type: 'Normal',
        reason: 'Started',
        message: 'Started container web in pod unified-devops-web-74b8f8d99c-x29q8',
      },
    ],
  },
  {
    id: 'dep-storefront-prod-02',
    repositoryId: 'repo-storefront-react',
    repositoryName: 'ecommerce-storefront-web',
    environment: 'production',
    namespace: 'storefront-prod',
    imageTag: '9a3d11b-87',
    commitSha: '9a3d11b',
    status: 'healthy',
    deployedAt: '2026-10-17T16:20:00Z',
    blueprintVersion: 'v1.0.0',
    pipelineId: 'pipe-exec-40',
    replicas: {
      desired: 4,
      ready: 4,
    },
    endpoints: ['https://shop.enterprise-org.com'],
    events: [
      {
        timestamp: '2026-10-17T16:20:10Z',
        type: 'Normal',
        reason: 'DeploymentReady',
        message: 'All 4 pods ready and serving traffic through ingress',
      },
    ],
  },
  {
    id: 'dep-payments-staging-03',
    repositoryId: 'repo-payments-api',
    repositoryName: 'payment-processing-service',
    environment: 'staging',
    namespace: 'payments-staging',
    imageTag: '7b2c90f-19',
    commitSha: '7b2c90f',
    status: 'degraded',
    deployedAt: '2026-10-16T09:10:00Z',
    blueprintVersion: 'v1.0.0',
    pipelineId: 'pipe-exec-39',
    replicas: {
      desired: 2,
      ready: 1,
    },
    endpoints: ['http://payments-service.payments-staging.svc.cluster.local:8080'],
    events: [
      {
        timestamp: '2026-10-16T09:12:00Z',
        type: 'Warning',
        reason: 'Unhealthy',
        message: 'Readiness probe failed: HTTP status 503 from /actuator/health',
      },
    ],
  },
];
