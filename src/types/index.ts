// Common & API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  isMockData?: boolean;
}

// Repository Types
export interface Repository {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  defaultBranch: string;
  language: string;
  description: string;
  visibility: 'public' | 'private';
  url: string;
  connectionStatus: 'connected' | 'demo' | 'disconnected';
  lastAnalyzedAt?: string;
  latestPipelineStatus?: 'success' | 'failed' | 'running' | 'pending' | 'none';
  latestDeploymentStatus?: 'healthy' | 'degraded' | 'pending' | 'none';
  blueprintStatus?: 'draft' | 'pending_approval' | 'approved' | 'none';
}

// Repository Evidence & Analysis Types
export interface AnalysisEvidence {
  category: 'stack' | 'package_manager' | 'scripts' | 'docker' | 'kubernetes' | 'ci';
  file: string;
  snippet?: string;
  matchedRule: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  id: string;
  repositoryId: string;
  status: 'in_progress' | 'completed' | 'failed';
  analyzedAt: string;
  detectedStack: {
    framework: string;
    runtime: string;
    version: string;
    language: string;
  };
  packageManager: {
    name: string;
    lockfilePresent: boolean;
  };
  scripts: {
    build?: string;
    test?: string;
    start?: string;
    dev?: string;
    lint?: string;
  };
  existingConfig: {
    hasDockerfile: boolean;
    hasKubernetes: boolean;
    hasJenkinsfile: boolean;
    hasTerraform: boolean;
  };
  evidence: AnalysisEvidence[];
  missingRequirements: string[];
  warnings: string[];
  confidenceScore: number; // 0-100
  recommendedBlueprintTemplate: string;
}

// Blueprint Types
export interface DevOpsBlueprint {
  id: string;
  repositoryId: string;
  repositoryName: string;
  version: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'superseded';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  stack: string;
  deploymentTarget: string;
  config: {
    app: {
      name: string;
      port: number;
      envVars: Record<string, string>;
    };
    build: {
      tool: string;
      command: string;
      artifactDir: string;
    };
    test: {
      command: string;
      requiredPassing: boolean;
    };
    container: {
      baseImage: string;
      targetPort: number;
      context: string;
      multistage: boolean;
    };
    registry: {
      target: string;
      repository: string;
      tagPattern: string;
    };
    security: {
      sonarqube: {
        enabled: boolean;
        projectKey: string;
        qualityGate: string;
      };
      trivy: {
        enabled: boolean;
        severityThreshold: 'CRITICAL' | 'HIGH' | 'MEDIUM';
        failOnSeverity: boolean;
      };
    };
    deployment: {
      type: 'kubernetes' | 'helm';
      namespace: string;
      replicas: number;
      serviceType: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
      resources: {
        cpu: string;
        memory: string;
      };
    };
    infrastructure: {
      provider: 'azure' | 'aws' | 'gcp' | 'kubernetes-local';
      managedResources: string[];
    };
    observability: {
      prometheusScrape: boolean;
      prometheusPort: number;
      grafanaDashboard: string;
    };
  };
  assumptions: string[];
  warnings: string[];
}

// Artifact Types
export interface GeneratedArtifact {
  id: string;
  blueprintId: string;
  blueprintVersion: string;
  repositoryId: string;
  filename: string;
  fileType:
    | 'jenkinsfile'
    | 'dockerfile'
    | 'dockerignore'
    | 'github_workflow'
    | 'k8s_deployment'
    | 'k8s_service'
    | 'k8s_configmap'
    | 'terraform_main'
    | 'terraform_vars';
  content: string;
  status: 'generated' | 'outdated' | 'unavailable';
  updatedAt: string;
  language: 'groovy' | 'dockerfile' | 'yaml' | 'hcl' | 'plaintext';
}

// Pipeline Types
export type PipelineStageStatus = 'success' | 'failed' | 'running' | 'pending' | 'skipped';

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  status: PipelineStageStatus;
  durationSeconds?: number;
  startedAt?: string;
  logs?: string[];
  failureReason?: string;
}

export interface PipelineExecution {
  id: string;
  repositoryId: string;
  repositoryName: string;
  branch: string;
  commitSha: string;
  commitMessage: string;
  buildNumber: number;
  triggerSource: 'manual' | 'github_push' | 'webhook';
  startTime: string;
  durationSeconds: number;
  status: 'success' | 'failed' | 'running' | 'queued' | 'aborted';
  stages: PipelineStage[];
  testResults?: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
    coveragePercent?: number;
  };
  qualityGate?: {
    status: 'passed' | 'failed' | 'warning';
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
  };
  securityScan?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    blockedDeployment: boolean;
  };
  imageArtifact?: {
    imageTag: string;
    registry: string;
    digest: string;
  };
  deploymentOutcome?: {
    environment: string;
    namespace: string;
    status: 'deployed' | 'failed' | 'blocked';
  };
}

// Security Center Types
export interface VulnerabilityFinding {
  id: string;
  pkgName: string;
  installedVersion: string;
  fixedVersion?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  target: string;
}

export interface SecurityOverview {
  repositoryId: string;
  repositoryName: string;
  lastScanDate: string;
  scanStatus: 'scanned' | 'unconfigured' | 'scanning' | 'failed';
  policyGatePassed: boolean;
  blockedDeploymentReason?: string;
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  vulnerabilities: VulnerabilityFinding[];
  sonarqube: {
    configured: boolean;
    status: 'OK' | 'ERROR' | 'WARN' | 'NOT_CONFIGURED';
    coverage: number;
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
  };
}

// Deployment Types
export interface DeploymentItem {
  id: string;
  repositoryId: string;
  repositoryName: string;
  environment: 'production' | 'staging' | 'preview';
  namespace: string;
  imageTag: string;
  commitSha: string;
  status: 'healthy' | 'degraded' | 'deploying' | 'failed';
  deployedAt: string;
  blueprintVersion: string;
  pipelineId: string;
  replicas: {
    desired: number;
    ready: number;
  };
  endpoints: string[];
  events: Array<{
    timestamp: string;
    type: 'Normal' | 'Warning';
    reason: string;
    message: string;
  }>;
}

// Infrastructure Types
export interface InfrastructureItem {
  id: string;
  provider: 'azure' | 'aws' | 'gcp' | 'kubernetes-local';
  clusterName: string;
  region: string;
  environment: string;
  stateStatus: 'synchronized' | 'drift_detected' | 'planning' | 'error';
  terraformVersion: string;
  managedResourcesCount: number;
  lastApplyAt: string;
  planHistory: Array<{
    id: string;
    action: 'apply' | 'plan';
    status: 'success' | 'failed';
    timestamp: string;
    resourcesAdded: number;
    resourcesChanged: number;
    resourcesDestroyed: number;
    outputSnippet: string;
  }>;
}

// Observability Types
export interface ObservabilityMetrics {
  prometheusConnected: boolean;
  grafanaConnected: boolean;
  applicationHealth: 'healthy' | 'degraded' | 'offline';
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  requestRateRps: number;
  errorRatePercent: number;
  metricsHistory: Array<{
    timestamp: string;
    cpu: number;
    memory: number;
    requests: number;
    errors: number;
  }>;
  dashboards: Array<{
    title: string;
    url: string;
    category: string;
    external: boolean;
  }>;
}

// Integration Types
export type IntegrationCategory =
  | 'vcs'
  | 'ci'
  | 'container'
  | 'registry'
  | 'security'
  | 'orchestration'
  | 'iac'
  | 'monitoring';

export type IntegrationStatus =
  | 'connected'
  | 'not_configured'
  | 'verification_required'
  | 'error'
  | 'unavailable';

export interface IntegrationConfigField {
  key: string;
  label: string;
  placeholder: string;
  isSecret: boolean;
  value?: string;
  helpText?: string;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  description: string;
  docsUrl: string;
  configFields: IntegrationConfigField[];
  lastVerifiedAt?: string;
  errorMessage?: string;
  isSimulatedDemo?: boolean;
}
