import { ObservabilityMetrics } from '@/types';

export const mockObservability: ObservabilityMetrics = {
  prometheusConnected: true,
  grafanaConnected: true,
  applicationHealth: 'healthy',
  cpuUsagePercent: 34.5,
  memoryUsagePercent: 61.2,
  requestRateRps: 184.2,
  errorRatePercent: 0.04,
  metricsHistory: [
    { timestamp: '14:00', cpu: 28, memory: 58, requests: 120, errors: 0.01 },
    { timestamp: '14:05', cpu: 32, memory: 59, requests: 145, errors: 0.02 },
    { timestamp: '14:10', cpu: 44, memory: 63, requests: 195, errors: 0.05 },
    { timestamp: '14:15', cpu: 39, memory: 62, requests: 178, errors: 0.03 },
    { timestamp: '14:20', cpu: 31, memory: 60, requests: 160, errors: 0.02 },
    { timestamp: '14:25', cpu: 35, memory: 61, requests: 184, errors: 0.04 },
  ],
  dashboards: [
    {
      title: 'Kubernetes Pod Performance (Grafana)',
      url: 'https://grafana.internal/d/k8s-pod-overview',
      category: 'Workloads',
      external: true,
    },
    {
      title: 'DevOps CI/CD DORA Metrics',
      url: 'https://grafana.internal/d/devops-dora',
      category: 'Pipelines',
      external: true,
    },
    {
      title: 'Trivy & SonarQube Security Gate Trends',
      url: 'https://grafana.internal/d/security-trends',
      category: 'Security',
      external: true,
    },
  ],
};
