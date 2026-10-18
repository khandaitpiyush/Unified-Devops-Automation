import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  PlaySquare,
  ShieldCheck,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Plus,
  CheckCircle2,
  Clock,
  Server,
  Activity,
  Terminal,
  RotateCcw,
  Cpu,
  FileCode2,
  ScrollText,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { StatusPill } from '@/components/common/StatusPill';
import { repositoryService } from '@/services/repositoryService';
import { pipelineService } from '@/services/pipelineService';
import { deploymentService } from '@/services/deploymentService';
import { securityService } from '@/services/securityService';
import { Repository, PipelineExecution, DeploymentItem, SecurityOverview } from '@/types';
import { formatDate, formatDuration } from '@/lib/utils';
import { animateFadeIn } from '@/lib/animations';

import { DoraMetricsGrid } from './components/DoraMetricsGrid';
import { WorkspaceRepoSelector } from './components/WorkspaceRepoSelector';
import { PipelineFleetConsole } from './components/PipelineFleetConsole';
import { WorkloadDeploymentsConsole } from './components/WorkloadDeploymentsConsole';
import { SecurityQualityMatrix } from './components/SecurityQualityMatrix';
import { WorkspaceManifestModal } from './components/WorkspaceManifestModal';
import { DevOpsTerminalDrawer } from './components/DevOpsTerminalDrawer';
import { TriggerPipelineModal } from '../pipelines/TriggerPipelineModal';

export const DashboardPage: React.FC = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>('repo-unified-devops');
  const [pipelines, setPipelines] = useState<PipelineExecution[]>([]);
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [security, setSecurity] = useState<SecurityOverview | null>(null);
  const [loading, setLoading] = useState(true);

  // Workspace sub-tab view state
  const [activeView, setActiveView] = useState<'overview' | 'pipelines' | 'deployments' | 'security'>('overview');

  // Modals & Terminal Drawer State
  const [triggerModalOpen, setTriggerModalOpen] = useState(false);
  const [manifestModalOpen, setManifestModalOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalBuildNumber, setTerminalBuildNumber] = useState<number>(42);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [reposRes, pipesRes, depsRes, secRes] = await Promise.all([
        repositoryService.getRepositories(),
        pipelineService.getPipelines(),
        deploymentService.getDeployments(),
        securityService.getSecurityOverview(selectedRepoId),
      ]);
      setRepos(reposRes.data);
      setPipelines(pipesRes.data);
      setDeployments(depsRes.data);
      setSecurity(secRes.data);
    } finally {
      setLoading(false);
    }
  }, [selectedRepoId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!loading) {
      animateFadeIn(containerRef.current, { duration: 0.35, y: 8 });
    }
  }, [loading]);

  const currentRepo = repos.find((r) => r.id === selectedRepoId) || repos[0];

  const handleOpenTerminalWithBuild = (buildNum?: number) => {
    if (buildNum) setTerminalBuildNumber(buildNum);
    setTerminalOpen(true);
  };

  return (
    <div ref={containerRef} className="space-y-6 pb-20">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              DevOps Engineering Workspace & Control Center
            </h1>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              live-telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full repository lifecycle telemetry, DORA metrics, autonomous CI/CD pipelines, and Kubernetes rollouts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/app/repositories">
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Connect Repo
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setTriggerModalOpen(true)}
            leftIcon={<PlaySquare className="w-3.5 h-3.5" />}
          >
            Dispatch Pipeline
          </Button>
        </div>
      </div>

      {/* Repository Context Switcher & Action Ribbon */}
      <WorkspaceRepoSelector
        repositories={repos}
        selectedRepoId={selectedRepoId}
        onSelectRepo={setSelectedRepoId}
        onTriggerPipeline={() => setTriggerModalOpen(true)}
        onOpenManifests={() => setManifestModalOpen(true)}
        onToggleTerminal={() => setTerminalOpen(!terminalOpen)}
        terminalOpen={terminalOpen}
      />

      {/* DORA Performance Metrics & Cluster Resource Gauges */}
      <DoraMetricsGrid
        deploymentFrequency="4.8 / day"
        leadTime="14m 32s"
        changeFailureRate="1.8%"
        mttr="8m 40s"
        readyReplicas={3}
        totalReplicas={3}
        cpuPercent={28}
        memoryPercent={41}
      />

      {/* Workspace Perspective Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          {(
            [
              { id: 'overview', label: 'Unified Control Plane' },
              { id: 'pipelines', label: 'CI/CD Pipeline Fleet', count: pipelines.length },
              { id: 'deployments', label: 'Kubernetes Workloads', count: deployments.length },
              { id: 'security', label: 'Security & Quality Gate' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {'count' in tab && tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    activeView === tab.id
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setTerminalOpen(!terminalOpen)}
          className="text-xs font-mono text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
          title="Toggle Streaming Terminal"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>Console: {terminalOpen ? 'Active' : 'Hidden'}</span>
        </button>
      </div>

      {/* Tab View 1: Unified Control Plane (Default Main View) */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Active CI/CD Pipelines & Kubernetes Workloads */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pipelines Fleet Console */}
            <PipelineFleetConsole
              pipelines={pipelines}
              onTriggerModal={() => setTriggerModalOpen(true)}
              onOpenTerminal={handleOpenTerminalWithBuild}
            />

            {/* Kubernetes Deployments & Replica Console */}
            <WorkloadDeploymentsConsole
              deployments={deployments}
              onRefresh={loadData}
              onOpenTerminal={() => setTerminalOpen(true)}
            />
          </div>

          {/* Right Column (1 Col): Security Matrix, Blueprint Readiness, & Action Center */}
          <div className="space-y-6">
            {/* Security Enforcement Matrix */}
            <SecurityQualityMatrix
              security={security}
              onRefresh={loadData}
              onOpenTerminal={() => setTerminalOpen(true)}
              repositoryId={selectedRepoId}
            />

            {/* Active Blueprint & Fingerprint Spec */}
            <Card>
              <CardHeader className="py-3">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-primary-600" />
                  <CardTitle>DevOps Blueprint Spec</CardTitle>
                </div>
                <Link to="/app/blueprints" className="text-[11px] text-primary-600 hover:underline">
                  Inspect Spec
                </Link>
              </CardHeader>
              <CardContent className="space-y-3 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-subtle border border-border space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Framework Stack</span>
                    <span className="font-semibold text-slate-900">
                      {currentRepo?.language || 'React + Vite + Node 22'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Cluster</span>
                    <span className="font-mono text-slate-800">aks-devops-eastus-01</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Container Registry</span>
                    <span className="font-mono text-slate-800">ghcr.io</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Blueprint Version</span>
                    <span className="font-mono font-bold text-emerald-700">v1.2.0 (Approved)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setManifestModalOpen(true)}
                    leftIcon={<ScrollText className="w-3.5 h-3.5" />}
                    className="flex-1"
                  >
                    View Manifests
                  </Button>
                  <Link to={`/app/analyze?repoId=${selectedRepoId}`} className="flex-1">
                    <Button variant="secondary" size="xs" className="w-full">
                      Re-Analyze
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Automation Commands */}
            <Card className="p-4 bg-slate-900 text-white space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center text-white">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Engine Automation Active</p>
                  <p className="text-[10px] text-slate-400">Continuous delivery on branch commit</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Repository changes pushed to <code className="text-emerald-400 font-mono">main</code> trigger autonomous multi-stage testing, Trivy vulnerability auditing, GHCR publishing, and zero-downtime rolling updates.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => setTriggerModalOpen(true)}
                  className="flex-1"
                >
                  Run Pipeline
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setTerminalOpen(true)}
                  className="flex-1"
                >
                  Stream Logs
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab View 2: CI/CD Pipeline Fleet */}
      {activeView === 'pipelines' && (
        <div className="space-y-6">
          <PipelineFleetConsole
            pipelines={pipelines}
            onTriggerModal={() => setTriggerModalOpen(true)}
            onOpenTerminal={handleOpenTerminalWithBuild}
          />
        </div>
      )}

      {/* Tab View 3: Kubernetes Workloads & Deployments */}
      {activeView === 'deployments' && (
        <div className="space-y-6">
          <WorkloadDeploymentsConsole
            deployments={deployments}
            onRefresh={loadData}
            onOpenTerminal={() => setTerminalOpen(true)}
          />
        </div>
      )}

      {/* Tab View 4: Security & Quality Gates */}
      {activeView === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SecurityQualityMatrix
            security={security}
            onRefresh={loadData}
            onOpenTerminal={() => setTerminalOpen(true)}
            repositoryId={selectedRepoId}
          />

          <Card className="p-4 space-y-3">
            <CardTitle>Zero-Critical Vulnerability Policy</CardTitle>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every container build generated from your repository is subjected to strict CVE scanning. Critical and high vulnerabilities automatically halt deployment to AKS until patched.
            </p>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-semibold">Policy Status: Active & Enforced</p>
              <p className="text-[11px] text-emerald-800">
                0 Critical CVEs detected across 1,643 scanned packages.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Modals & Terminal Drawers */}
      <TriggerPipelineModal
        isOpen={triggerModalOpen}
        onClose={() => setTriggerModalOpen(false)}
        repositories={repos}
        onTriggered={loadData}
      />

      <WorkspaceManifestModal
        isOpen={manifestModalOpen}
        onClose={() => setManifestModalOpen(false)}
        repositoryName={currentRepo?.name}
      />

      <DevOpsTerminalDrawer
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        activeRepositoryName={currentRepo?.name}
        buildNumber={terminalBuildNumber}
      />
    </div>
  );
};
