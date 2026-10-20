import {
  Repository,
  AnalysisResult,
  DevOpsBlueprint,
  GeneratedArtifact,
  PipelineExecution,
  SecurityOverview,
  DeploymentItem,
  InfrastructureItem,
  ObservabilityMetrics,
  IntegrationItem,
  PlatformSettings,
  UserProfile,
} from '../types/index.js';
import { RepoAnalyzer } from '../analyzers/repoAnalyzer.js';
import { ArtifactGenerator } from '../generators/artifactGenerator.js';

class DataStore {
  public repositories: Repository[] = [
    {
      id: 'repo-unified-devops',
      name: 'unified-devops-automation',
      owner: 'khandaitpiyush',
      fullName: 'khandaitpiyush/unified-devops-automation',
      defaultBranch: 'main',
      language: 'TypeScript / React',
      description: 'Autonomous developer control plane with explainable blueprints and security-gated CI/CD.',
      visibility: 'public',
      url: 'https://github.com/khandaitpiyush/unified-devops-automation',
      connectionStatus: 'connected',
      lastAnalyzedAt: '2026-10-18T10:15:00Z',
      latestPipelineStatus: 'success',
      latestDeploymentStatus: 'healthy',
      blueprintStatus: 'approved',
    },
  ];

  public analyses: Record<string, AnalysisResult> = {};
  public blueprints: DevOpsBlueprint[] = [];
  public artifacts: GeneratedArtifact[] = [];
  public pipelines: PipelineExecution[] = [];
  public securityData: Record<string, SecurityOverview> = {};
  public deployments: DeploymentItem[] = [];
  public infrastructure: InfrastructureItem[] = [];
  public observability: ObservabilityMetrics;
  public integrations: IntegrationItem[] = [];
  public settings: PlatformSettings;
  public currentUser: UserProfile;

  constructor() {
    this.currentUser = {
      id: 'usr-devops-01',
      name: 'Piyush Khandait',
      email: 'devops@platform.internal',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      role: 'DevOps Engineer',
      githubUsername: 'khandaitpiyush',
    };

    this.settings = {
      general: {
        platformName: 'Unified DevOps Automation',
        environment: 'production',
        requireBlueprintApproval: true,
        autoTriggerOnPush: true,
      },
      security: {
        enforceZeroCriticalCVE: true,
        minSonarCodeCoverage: 80,
        blockedDeploymentAlerts: true,
      },
      notifications: {
        slackWebhookConfigured: true,
        emailAlertsEnabled: true,
      },
    };

    this.observability = {
      prometheusConnected: true,
      grafanaConnected: true,
      applicationHealth: 'healthy',
      cpuUsagePercent: 28,
      memoryUsagePercent: 41,
      requestRateRps: 1420,
      errorRatePercent: 0.02,
      metricsHistory: [
        { timestamp: '10:00', cpu: 22, memory: 38, requests: 1200, errors: 0 },
        { timestamp: '10:05', cpu: 24, memory: 39, requests: 1280, errors: 0 },
        { timestamp: '10:10', cpu: 32, memory: 44, requests: 1540, errors: 1 },
        { timestamp: '10:15', cpu: 28, memory: 41, requests: 1420, errors: 0 },
      ],
      dashboards: [
        {
          title: 'Kubernetes Workload Cluster Metrics',
          url: 'http://grafana.platform.internal:3000/d/k8s-workloads',
          category: 'Cluster',
          external: true,
        },
        {
          title: 'Jenkins CI/CD Build Progression & Latency',
          url: 'http://grafana.platform.internal:3000/d/jenkins-fleet',
          category: 'CI/CD',
          external: true,
        },
      ],
    };

    // Seed Initial Analysis
    this.repositories.forEach((repo) => {
      this.analyses[repo.id] = RepoAnalyzer.analyze(repo);
    });

    // Seed Blueprint for Primary Repo
    const primaryBp: DevOpsBlueprint = {
      id: 'bp-unified-devops-01',
      repositoryId: 'repo-unified-devops',
      repositoryName: 'unified-devops-automation',
      version: 'v1.2.0',
      status: 'approved',
      createdAt: '2026-10-18T10:20:00Z',
      approvedAt: '2026-10-18T10:25:00Z',
      approvedBy: 'Piyush Khandait',
      stack: 'React 18 + Node.js 22 LTS + Nginx',
      deploymentTarget: 'Azure Kubernetes Service (AKS)',
      config: {
        app: {
          name: 'unified-devops-automation',
          port: 80,
          envVars: {
            NODE_ENV: 'production',
            PORT: '80',
          },
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
          repository: 'unified-devops-automation',
          tagPattern: '${BUILD_NUMBER}',
        },
        security: {
          sonarqube: {
            enabled: true,
            projectKey: 'unified-devops-automation',
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
          managedResources: ['azurerm_kubernetes_cluster.aks', 'azurerm_resource_group.rg'],
        },
        observability: {
          prometheusScrape: true,
          prometheusPort: 80,
          grafanaDashboard: 'k8s-workloads',
        },
      },
      assumptions: [
        'Single page application assets served via multi-stage hardened Nginx',
        'Ingress routed through ingress-nginx with automated TLS cert-manager',
      ],
      warnings: [],
    };
    this.blueprints.push(primaryBp);

    // Generate artifacts from blueprint
    this.artifacts = ArtifactGenerator.generateAll(primaryBp);

    // Seed Pipelines
    this.pipelines = [
      {
        id: 'pipe-exec-42',
        repositoryId: 'repo-unified-devops',
        repositoryName: 'unified-devops-automation',
        branch: 'main',
        commitSha: 'd5656e6',
        commitMessage: 'feat(core): implement explainable blueprint approval gate',
        buildNumber: 42,
        triggerSource: 'github_push',
        startTime: '2026-10-18T10:14:02Z',
        durationSeconds: 53,
        status: 'success',
        stages: [
          { id: 'stg-1', name: 'Checkout Source', order: 1, status: 'success', durationSeconds: 4 },
          { id: 'stg-2', name: 'Install Dependencies', order: 2, status: 'success', durationSeconds: 9 },
          { id: 'stg-3', name: 'Run Tests & Lint', order: 3, status: 'success', durationSeconds: 6 },
          { id: 'stg-4', name: 'SonarQube Quality Gate', order: 4, status: 'success', durationSeconds: 7 },
          { id: 'stg-5', name: 'Trivy Security Scan', order: 5, status: 'success', durationSeconds: 6 },
          { id: 'stg-6', name: 'Build Docker Image', order: 6, status: 'success', durationSeconds: 8 },
          { id: 'stg-7', name: 'Push Image to GHCR', order: 7, status: 'success', durationSeconds: 5 },
          { id: 'stg-8', name: 'Deploy to Kubernetes', order: 8, status: 'success', durationSeconds: 6 },
          { id: 'stg-9', name: 'Record Telemetry', order: 9, status: 'success', durationSeconds: 2 },
        ],
        testResults: { passed: 48, failed: 0, skipped: 0, total: 48, coveragePercent: 94.2 },
        qualityGate: { status: 'passed', bugs: 0, vulnerabilities: 0, codeSmells: 3 },
        securityScan: { critical: 0, high: 0, medium: 2, low: 4, blockedDeployment: false },
        imageArtifact: {
          imageTag: 'ghcr.io/khandaitpiyush/unified-devops-automation:v1.0.0',
          registry: 'ghcr.io',
          digest: 'sha256:7f9b8c12a4...',
        },
        deploymentOutcome: { environment: 'production', namespace: 'production', status: 'deployed' },
      },
    ];

    // Seed Security Overview
    this.securityData['repo-unified-devops'] = {
      repositoryId: 'repo-unified-devops',
      repositoryName: 'unified-devops-automation',
      lastScanDate: new Date().toISOString(),
      scanStatus: 'scanned',
      policyGatePassed: true,
      severityCounts: {
        critical: 0,
        high: 0,
        medium: 2,
        low: 4,
      },
      vulnerabilities: [
        {
          id: 'CVE-2024-2961',
          pkgName: 'glibc',
          installedVersion: '2.38-r1',
          fixedVersion: '2.39-r2',
          severity: 'MEDIUM',
          title: 'glibc iconv buffer overflow',
          description: 'A buffer overflow vulnerability in iconv when converting ISO-2022-CN-EXT strings.',
          target: 'Alpine base image',
        },
        {
          id: 'CVE-2024-24790',
          pkgName: 'net/netip',
          installedVersion: '1.21.0',
          fixedVersion: '1.21.9',
          severity: 'MEDIUM',
          title: 'Go net/netip unexpectedly accepts non-IPv4 addresses',
          description: 'Non-canonical IPv4 strings might be parsed without validation.',
          target: 'Go runner',
        },
      ],
      sonarqube: {
        configured: true,
        status: 'OK',
        coverage: 94.2,
        bugs: 0,
        vulnerabilities: 0,
        codeSmells: 3,
      },
    };

    // Seed Deployments
    this.deployments = [
      {
        id: 'dep-unified-devops-01',
        repositoryId: 'repo-unified-devops',
        repositoryName: 'unified-devops-automation',
        environment: 'production',
        namespace: 'production',
        imageTag: 'ghcr.io/khandaitpiyush/unified-devops-automation:v1.0.0',
        commitSha: 'd5656e6',
        status: 'healthy',
        deployedAt: '2026-10-18T10:14:52Z',
        blueprintVersion: 'v1.2.0',
        pipelineId: 'pipe-exec-42',
        replicas: { desired: 3, ready: 3 },
        endpoints: ['https://devops.platform.internal'],
        events: [
          {
            timestamp: '2026-10-18T10:14:52Z',
            type: 'Normal',
            reason: 'Started',
            message: 'Started container unified-devops-automation on node aks-systempool-vmss-000001',
          },
          {
            timestamp: '2026-10-18T10:14:50Z',
            type: 'Normal',
            reason: 'Pulling',
            message: 'Pulling image ghcr.io/khandaitpiyush/unified-devops-automation:v1.0.0',
          },
        ],
      },
    ];

    // Seed Infrastructure
    this.infrastructure = [
      {
        id: 'infra-aks-eastus-01',
        provider: 'azure',
        clusterName: 'aks-devops-eastus-01',
        region: 'East US',
        environment: 'production',
        stateStatus: 'synchronized',
        terraformVersion: '1.8.4',
        managedResourcesCount: 24,
        lastApplyAt: '2026-10-18T08:00:00Z',
        planHistory: [
          {
            id: 'plan-1',
            action: 'apply',
            status: 'success',
            timestamp: '2026-10-18T08:00:00Z',
            resourcesAdded: 0,
            resourcesChanged: 1,
            resourcesDestroyed: 0,
            outputSnippet: 'Apply complete! Resources: 0 added, 1 changed, 0 destroyed.',
          },
        ],
      },
    ];

    // Seed Integrations
    this.integrations = [
      {
        id: 'int-github',
        name: 'GitHub Enterprise / GitHub.com',
        category: 'vcs',
        status: 'connected',
        description: 'VCS webhooks, PR status checks, and OAuth repository synchronization.',
        docsUrl: 'https://docs.github.com/en/rest',
        lastVerifiedAt: '2026-10-18T10:00:00Z',
        configFields: [
          { key: 'appId', label: 'GitHub App ID', placeholder: '123456', isSecret: false, value: '892110' },
          { key: 'privateKey', label: 'Private Key (.pem)', placeholder: '-----BEGIN RSA PRIVATE KEY-----', isSecret: true },
        ],
      },
      {
        id: 'int-jenkins',
        name: 'Jenkins CI/CD Automation',
        category: 'ci',
        status: 'connected',
        description: 'Autonomous multi-stage pipeline dispatching, live log streaming, and build status telemetry.',
        docsUrl: 'https://www.jenkins.io/doc/book/using/remote-access-api/',
        lastVerifiedAt: '2026-10-18T10:14:00Z',
        configFields: [
          { key: 'url', label: 'Jenkins Server URL', placeholder: 'http://jenkins:8080', isSecret: false, value: 'http://jenkins.platform.internal:8080' },
          { key: 'token', label: 'API User Token', placeholder: '11a2b3c4...', isSecret: true },
        ],
      },
      {
        id: 'int-ghcr',
        name: 'GitHub Container Registry (GHCR)',
        category: 'registry',
        status: 'connected',
        description: 'OCI container image publishing, layer caching, and automated vulnerability scanning target.',
        docsUrl: 'https://docs.github.com/en/packages/working-with-a-github-packages-registry',
        lastVerifiedAt: '2026-10-18T10:14:40Z',
        configFields: [
          { key: 'registry', label: 'Registry Host', placeholder: 'ghcr.io', isSecret: false, value: 'ghcr.io' },
        ],
      },
      {
        id: 'int-aks',
        name: 'Azure Kubernetes Service (AKS)',
        category: 'orchestration',
        status: 'connected',
        description: 'Managed Kubernetes cluster runtime, pod scheduling, zero-downtime rolling updates, and ingress.',
        docsUrl: 'https://learn.microsoft.com/en-us/azure/aks/',
        lastVerifiedAt: '2026-10-18T10:15:00Z',
        configFields: [
          { key: 'cluster', label: 'Cluster Name', placeholder: 'aks-devops-01', isSecret: false, value: 'aks-devops-eastus-01' },
        ],
      },
      {
        id: 'int-sonarqube',
        name: 'SonarQube Quality Gate',
        category: 'security',
        status: 'connected',
        description: 'Automated static analysis, code coverage thresholds, bug tracking, and gate enforcement.',
        docsUrl: 'https://docs.sonarsource.com/sonarqube/latest/',
        lastVerifiedAt: '2026-10-18T10:14:24Z',
        configFields: [
          { key: 'url', label: 'SonarQube Server URL', placeholder: 'http://sonarqube:9000', isSecret: false, value: 'http://sonarqube.platform.internal:9000' },
        ],
      },
      {
        id: 'int-trivy',
        name: 'Trivy Container Security Scanner',
        category: 'security',
        status: 'connected',
        description: 'Comprehensive container vulnerability (CVE) scanning and Zero-Critical gate enforcement.',
        docsUrl: 'https://aquasecurity.github.io/trivy/',
        lastVerifiedAt: '2026-10-18T10:14:31Z',
        configFields: [
          { key: 'severityThreshold', label: 'Block Threshold', placeholder: 'CRITICAL', isSecret: false, value: 'CRITICAL' },
        ],
      },
      {
        id: 'int-prometheus',
        name: 'Prometheus & Grafana Telemetry',
        category: 'monitoring',
        status: 'connected',
        description: 'Real-time DORA metrics, cluster vCPU/memory utilization, request latency, and HTTP throughput.',
        docsUrl: 'https://prometheus.io/docs/',
        lastVerifiedAt: '2026-10-18T10:15:10Z',
        configFields: [
          { key: 'promUrl', label: 'Prometheus URL', placeholder: 'http://prometheus:9090', isSecret: false, value: 'http://prometheus.platform.internal:9090' },
        ],
      },
    ];
  }
}

export const store = new DataStore();
