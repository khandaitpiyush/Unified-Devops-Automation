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
} from '@/types';
import { mockRepositories } from './fixtures/repositories';
import { mockAnalyses } from './fixtures/analyses';
import { mockBlueprints } from './fixtures/blueprints';
import { mockArtifacts } from './fixtures/artifacts';
import { mockPipelines } from './fixtures/pipelines';
import { mockSecurityData } from './fixtures/security';
import { mockDeployments } from './fixtures/deployments';
import { mockInfrastructure } from './fixtures/infrastructure';
import { mockObservability } from './fixtures/observability';
import { mockIntegrations } from './fixtures/integrations';

// In-memory state allowing interactive flows during session
let repositories = [...mockRepositories];
let analyses = { ...mockAnalyses };
let blueprints = [...mockBlueprints];
let artifacts = [...mockArtifacts];
let pipelines = [...mockPipelines];
let securityData = { ...mockSecurityData };
let deployments = [...mockDeployments];
let infrastructure = [...mockInfrastructure];
let integrations = [...mockIntegrations];

export const mockAdapter = {
  // Repositories
  async getRepositories(): Promise<Repository[]> {
    return [...repositories];
  },

  async getRepositoryById(id: string): Promise<Repository | null> {
    return repositories.find((r) => r.id === id) || null;
  },

  async connectRepository(repo: Partial<Repository>): Promise<Repository> {
    const newRepo: Repository = {
      id: `repo-${Date.now()}`,
      name: repo.name || 'new-connected-repo',
      owner: repo.owner || 'current-user',
      fullName: `${repo.owner || 'current-user'}/${repo.name || 'new-connected-repo'}`,
      defaultBranch: repo.defaultBranch || 'main',
      language: repo.language || 'TypeScript',
      description: repo.description || 'Newly connected repository for DevOps automation.',
      visibility: repo.visibility || 'public',
      url: repo.url || `https://github.com/${repo.owner || 'current-user'}/${repo.name || 'new-repo'}`,
      connectionStatus: 'connected',
      latestPipelineStatus: 'none',
      latestDeploymentStatus: 'none',
      blueprintStatus: 'none',
    };
    repositories = [newRepo, ...repositories];
    return newRepo;
  },

  // Analysis
  async getAnalysis(repoId: string): Promise<AnalysisResult | null> {
    return analyses[repoId] || null;
  },

  async triggerAnalysis(repoId: string): Promise<AnalysisResult> {
    const repo = repositories.find((r) => r.id === repoId);
    const existing = analyses[repoId];
    if (existing) {
      existing.analyzedAt = new Date().toISOString();
      return { ...existing };
    }

    const newAnalysis: AnalysisResult = {
      id: `analysis-${Date.now()}`,
      repositoryId: repoId,
      status: 'completed',
      analyzedAt: new Date().toISOString(),
      detectedStack: {
        framework: 'React + Node.js',
        runtime: 'Node.js 22 LTS',
        version: '1.0.0',
        language: repo?.language || 'TypeScript',
      },
      packageManager: {
        name: 'npm',
        lockfilePresent: true,
      },
      scripts: {
        build: 'npm run build',
        test: 'npm test',
        lint: 'npm run lint',
      },
      existingConfig: {
        hasDockerfile: false,
        hasKubernetes: false,
        hasJenkinsfile: false,
        hasTerraform: false,
      },
      evidence: [
        {
          category: 'stack',
          file: 'package.json',
          snippet: '"dependencies": { "react": "^18.3.1" }',
          matchedRule: 'react_core_package',
          confidence: 'high',
        },
        {
          category: 'package_manager',
          file: 'package-lock.json',
          snippet: '"lockfileVersion": 3',
          matchedRule: 'npm_lockfile_v3',
          confidence: 'high',
        },
      ],
      missingRequirements: [
        'Production Dockerfile missing',
        'Declarative Jenkinsfile pipeline missing',
        'Kubernetes deployment manifests missing',
      ],
      warnings: [
        'Recommend enabling automated security scans before initial Kubernetes deployment.',
      ],
      confidenceScore: 94,
      recommendedBlueprintTemplate: 'react-node-k8s-enterprise',
    };

    analyses[repoId] = newAnalysis;
    if (repo) {
      repo.lastAnalyzedAt = newAnalysis.analyzedAt;
      repo.blueprintStatus = 'draft';
    }
    return newAnalysis;
  },

  // Blueprints
  async getBlueprints(): Promise<DevOpsBlueprint[]> {
    return [...blueprints];
  },

  async getBlueprintById(id: string): Promise<DevOpsBlueprint | null> {
    return blueprints.find((b) => b.id === id) || null;
  },

  async getBlueprintsByRepo(repoId: string): Promise<DevOpsBlueprint[]> {
    return blueprints.filter((b) => b.repositoryId === repoId);
  },

  async approveBlueprint(blueprintId: string): Promise<DevOpsBlueprint> {
    const bp = blueprints.find((b) => b.id === blueprintId);
    if (!bp) throw new Error('Blueprint not found');
    bp.status = 'approved';
    bp.approvedAt = new Date().toISOString();
    bp.approvedBy = 'developer@organization.internal';

    // Update corresponding repository
    const repo = repositories.find((r) => r.id === bp.repositoryId);
    if (repo) {
      repo.blueprintStatus = 'approved';
    }
    return { ...bp };
  },

  async createBlueprint(bpData: Partial<DevOpsBlueprint>): Promise<DevOpsBlueprint> {
    const newBp: DevOpsBlueprint = {
      id: `bp-${Date.now()}`,
      repositoryId: bpData.repositoryId || 'repo-unified-devops',
      repositoryName: bpData.repositoryName || 'unified-devops-automation',
      version: bpData.version || `v1.${blueprints.length}.0`,
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      stack: bpData.stack || 'React + Node.js',
      deploymentTarget: bpData.deploymentTarget || 'Kubernetes (Azure AKS)',
      config: bpData.config || blueprints[0].config,
      assumptions: bpData.assumptions || ['Standard cloud container deployment.'],
      warnings: bpData.warnings || [],
    };
    blueprints = [newBp, ...blueprints];
    return newBp;
  },

  // Artifacts
  async getArtifacts(): Promise<GeneratedArtifact[]> {
    return [...artifacts];
  },

  async getArtifactsByRepo(repoId: string): Promise<GeneratedArtifact[]> {
    return artifacts.filter((a) => a.repositoryId === repoId);
  },

  async regenerateArtifacts(blueprintId: string): Promise<GeneratedArtifact[]> {
    const bp = blueprints.find((b) => b.id === blueprintId);
    if (!bp) throw new Error('Blueprint not found');
    const existing = artifacts.filter((a) => a.blueprintId === blueprintId);
    existing.forEach((a) => {
      a.status = 'generated';
      a.updatedAt = new Date().toISOString();
    });
    return [...artifacts];
  },

  // Pipelines
  async getPipelines(): Promise<PipelineExecution[]> {
    return [...pipelines];
  },

  async getPipelineById(id: string): Promise<PipelineExecution | null> {
    return pipelines.find((p) => p.id === id) || null;
  },

  async triggerPipeline(repoId: string, branch: string = 'main'): Promise<PipelineExecution> {
    const repo = repositories.find((r) => r.id === repoId);
    const newBuildNumber = pipelines.length + 42;
    const newPipeline: PipelineExecution = {
      id: `pipe-exec-${newBuildNumber}`,
      repositoryId: repoId,
      repositoryName: repo?.name || 'unknown-repository',
      branch,
      commitSha: Math.random().toString(16).substring(2, 9),
      commitMessage: 'feat: triggered autonomous devops pipeline run',
      buildNumber: newBuildNumber,
      triggerSource: 'manual',
      startTime: new Date().toISOString(),
      durationSeconds: 15,
      status: 'running',
      stages: [
        {
          id: 'stg-1',
          name: 'Checkout Source',
          order: 1,
          status: 'success',
          durationSeconds: 5,
          logs: ['Autonomous pipeline triggered manually', `Branch: ${branch}`],
        },
        {
          id: 'stg-2',
          name: 'Install Dependencies',
          order: 2,
          status: 'running',
          logs: ['Installing dependencies via npm ci...'],
        },
        { id: 'stg-3', name: 'Run Tests & Lint', order: 3, status: 'pending' },
        { id: 'stg-4', name: 'SonarQube Quality Gate', order: 4, status: 'pending' },
        { id: 'stg-5', name: 'Trivy Security Scan', order: 5, status: 'pending' },
        { id: 'stg-6', name: 'Build Docker Image', order: 6, status: 'pending' },
        { id: 'stg-7', name: 'Push Image to GHCR', order: 7, status: 'pending' },
        { id: 'stg-8', name: 'Deploy to Kubernetes', order: 8, status: 'pending' },
        { id: 'stg-9', name: 'Record Metadata', order: 9, status: 'pending' },
      ],
    };
    pipelines = [newPipeline, ...pipelines];
    if (repo) {
      repo.latestPipelineStatus = 'running';
    }
    return newPipeline;
  },

  // Security
  async getSecurityData(repoId?: string): Promise<SecurityOverview | null> {
    const key = repoId || 'repo-unified-devops';
    return securityData[key] || null;
  },

  async getAllSecurity(): Promise<Record<string, SecurityOverview>> {
    return { ...securityData };
  },

  // Deployments
  async getDeployments(): Promise<DeploymentItem[]> {
    return [...deployments];
  },

  async getDeploymentsByRepo(repoId: string): Promise<DeploymentItem[]> {
    return deployments.filter((d) => d.repositoryId === repoId);
  },

  // Infrastructure
  async getInfrastructure(): Promise<InfrastructureItem[]> {
    return [...infrastructure];
  },

  // Observability
  async getObservability(): Promise<ObservabilityMetrics> {
    return { ...mockObservability };
  },

  // Integrations
  async getIntegrations(): Promise<IntegrationItem[]> {
    return [...integrations];
  },

  async testIntegration(id: string): Promise<{ success: boolean; message: string }> {
    const item = integrations.find((i) => i.id === id);
    if (!item) return { success: false, message: 'Integration not found' };
    item.lastVerifiedAt = new Date().toISOString();
    return {
      success: true,
      message: `Verified connection to ${item.name} successfully.`,
    };
  },
};
