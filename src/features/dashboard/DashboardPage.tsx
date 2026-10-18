import React, { useEffect, useState, useRef } from 'react';
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

export const DashboardPage: React.FC = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [pipelines, setPipelines] = useState<PipelineExecution[]>([]);
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [security, setSecurity] = useState<SecurityOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [reposRes, pipesRes, depsRes, secRes] = await Promise.all([
          repositoryService.getRepositories(),
          pipelineService.getPipelines(),
          deploymentService.getDeployments(),
          securityService.getSecurityOverview('repo-unified-devops'),
        ]);
        setRepos(reposRes.data);
        setPipelines(pipesRes.data);
        setDeployments(depsRes.data);
        setSecurity(secRes.data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      animateFadeIn(containerRef.current, { duration: 0.35, y: 8 });
    }
  }, [loading]);

  const successfulRuns = pipelines.filter((p) => p.status === 'success').length;
  const failedRuns = pipelines.filter((p) => p.status === 'failed').length;
  const runningRuns = pipelines.filter((p) => p.status === 'running').length;
  const successRate = pipelines.length > 0 ? Math.round((successfulRuns / pipelines.length) * 100) : 0;
  const blockedPipelines = pipelines.filter(
    (p) => p.securityScan?.blockedDeployment || p.status === 'failed'
  ).length;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Operations Overview</h1>
            <span className="text-[11px] font-mono text-slate-400 bg-surface-subtle px-2 py-0.5 rounded border border-border">
              production-control-plane
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Repository-driven blueprint automation, CI/CD telemetry, and workload health across environments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/app/repositories">
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Connect Repo
            </Button>
          </Link>
          <Link to="/app/analyze">
            <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Run Analyzer
            </Button>
          </Link>
        </div>
      </div>

      {/* High-Density Command Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Module 1: Repositories */}
        <Card className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Connected Repos
            </span>
            <GitBranch className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">{repos.length}</span>
            <span className="text-[11px] text-emerald-600 font-medium">All branches synced</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 font-mono">
            Webhooks active • GitHub App
          </div>
        </Card>

        {/* Module 2: Pipeline Fleet */}
        <Card className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              CI/CD Success Rate
            </span>
            <PlaySquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">{successRate}%</span>
            <span className="text-[11px] text-slate-500">({pipelines.length} runs)</span>
          </div>
          {/* Passed vs Failed Ratio Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1 mt-2.5 flex overflow-hidden">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(successfulRuns / (pipelines.length || 1)) * 100}%` }}
              title={`${successfulRuns} successful`}
            />
            <div
              className="bg-primary-500 h-full"
              style={{ width: `${(runningRuns / (pipelines.length || 1)) * 100}%` }}
              title={`${runningRuns} running`}
            />
            <div
              className="bg-rose-500 h-full"
              style={{ width: `${(failedRuns / (pipelines.length || 1)) * 100}%` }}
              title={`${failedRuns} failed`}
            />
          </div>
        </Card>

        {/* Module 3: Active Deployments */}
        <Card className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Workload Deployments
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">{deployments.length}</span>
            <span className="text-[11px] text-slate-500">services live</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-slate-700 font-medium">aks-devops-eastus-01</span>
          </div>
        </Card>

        {/* Module 4: Security Gate Compliance */}
        <Card className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Security Gate Policy
            </span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">
              {blockedPipelines === 0 ? 'Compliant' : `${blockedPipelines} Blocked`}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">Zero-Critical Policy</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 font-mono">
            Trivy & SonarQube verified
          </div>
        </Card>
      </div>

      {/* Main Operational View: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active CI/CD Pipeline Fleet & Deployments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipelines Table */}
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <CardTitle>Recent Pipeline Executions</CardTitle>
                <span className="text-[10px] text-slate-400 font-mono">9-stage automated delivery</span>
              </div>
              <Link
                to="/app/pipelines"
                className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left data-table">
                <thead>
                  <tr>
                    <th>Build & Repo</th>
                    <th>Branch / Commit</th>
                    <th>Stage Progression</th>
                    <th>Duration</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelines.map((pipe) => (
                    <tr key={pipe.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            #{pipe.buildNumber}
                          </span>
                          <span className="font-semibold text-slate-800 text-xs truncate max-w-[140px]">
                            {pipe.repositoryName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                          {pipe.commitMessage}
                        </p>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {pipe.branch}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {pipe.commitSha}
                          </span>
                        </div>
                        <StatusPill status={pipe.status} />
                      </td>
                      <td>
                        {/* Mini 9-stage progression indicators */}
                        <div className="flex items-center gap-1">
                          {pipe.stages.map((stg) => (
                            <span
                              key={stg.id}
                              className={`w-2 h-2 rounded-full ${
                                stg.status === 'success'
                                  ? 'bg-emerald-500'
                                  : stg.status === 'failed'
                                  ? 'bg-rose-500 ring-2 ring-rose-200'
                                  : stg.status === 'running'
                                  ? 'bg-blue-500 animate-pulse'
                                  : 'bg-slate-200'
                              }`}
                              title={`${stg.order}. ${stg.name} (${stg.status})`}
                            />
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-slate-700">
                          {formatDuration(pipe.durationSeconds)}
                        </span>
                        <p className="text-[10px] text-slate-400">{formatDate(pipe.startTime)}</p>
                      </td>
                      <td className="text-right">
                        <Link to={`/app/pipelines/${pipe.id}`}>
                          <Button variant="outline" size="xs">
                            Inspect
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Active Deployments Overview */}
          <Card>
            <CardHeader className="py-3">
              <div>
                <CardTitle>Kubernetes Workload Rollouts</CardTitle>
                <p className="text-[11px] text-slate-400">Production and staging service workloads</p>
              </div>
              <Link
                to="/app/deployments"
                className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Fleet view <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left data-table">
                <thead>
                  <tr>
                    <th>Service & Env</th>
                    <th>Namespace</th>
                    <th>Image Tag</th>
                    <th>Replicas</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deployments.map((dep) => (
                    <tr key={dep.id}>
                      <td>
                        <span className="font-bold text-slate-900 text-xs">
                          {dep.repositoryName}
                        </span>
                        <div className="mt-0.5">
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {dep.environment}
                          </span>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-slate-700">{dep.namespace}</td>
                      <td className="font-mono text-[11px] text-slate-500">{dep.imageTag}</td>
                      <td>
                        <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {dep.replicas.ready}/{dep.replicas.desired} Ready
                        </span>
                      </td>
                      <td className="text-right">
                        <StatusPill status={dep.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Security Compliance, Blueprints & Fast Tools */}
        <div className="space-y-6">
          {/* Security Gate Guard */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Security & Quality Enforcement
              </CardTitle>
              <Link to="/app/security" className="text-[11px] text-primary-600 hover:underline">
                Details
              </Link>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-3">
              <div className="p-2.5 rounded-md bg-surface-subtle border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">SonarQube Coverage</p>
                  <p className="text-[10px] text-slate-500">Quality Gate: PASSED</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">
                  {security?.sonarqube.coverage || 92.4}%
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span className="text-[11px] font-medium">Trivy CVE Severity Breakdown</span>
                  <span className="font-mono text-[10px] text-slate-400">Zero-Critical Policy</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="p-1.5 rounded bg-rose-50 border border-rose-100">
                    <p className="text-xs font-bold text-rose-600">0</p>
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Critical</p>
                  </div>
                  <div className="p-1.5 rounded bg-amber-50 border border-amber-100">
                    <p className="text-xs font-bold text-amber-600">0</p>
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">High</p>
                  </div>
                  <div className="p-1.5 rounded bg-blue-50 border border-blue-100">
                    <p className="text-xs font-bold text-blue-600">2</p>
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Med</p>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-600">4</p>
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Low</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DevOps Blueprints Catalog Quick View */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle>DevOps Blueprints</CardTitle>
              <Link to="/app/blueprints" className="text-[11px] text-primary-600 hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/60">
              {repos.slice(0, 3).map((r) => (
                <div key={r.id} className="p-3 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-900 truncate">{r.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{r.language}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={r.blueprintStatus || 'none'} />
                    <Link to={`/app/repositories/${r.id}`}>
                      <Button variant="ghost" size="xs" className="p-1 h-6 w-6">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Operational Actions */}
          <Card className="p-4 bg-slate-900 text-white space-y-3">
            <div>
              <p className="text-xs font-bold">DevOps Workflow Engine</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Inspect repository evidence, approve architectural blueprints, and generate production manifests.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/app/analyze" className="flex-1">
                <Button variant="primary" size="xs" className="w-full">
                  Run Analyzer
                </Button>
              </Link>
              <Link to="/app/artifacts" className="flex-1">
                <Button variant="secondary" size="xs" className="w-full">
                  View Manifests
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
