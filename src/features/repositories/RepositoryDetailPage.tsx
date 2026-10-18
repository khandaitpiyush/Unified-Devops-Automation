import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  GitBranch,
  ExternalLink,
  SearchCode,
  FileCode2,
  ScrollText,
  PlaySquare,
  ShieldCheck,
  Layers,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Tabs } from '@/components/common/Tabs';
import { StatusPill } from '@/components/common/StatusPill';
import { CodeViewer } from '@/components/common/CodeViewer';
import { repositoryService } from '@/services/repositoryService';
import { analysisService } from '@/services/analysisService';
import { blueprintService } from '@/services/blueprintService';
import { artifactService } from '@/services/artifactService';
import { pipelineService } from '@/services/pipelineService';
import { securityService } from '@/services/securityService';
import {
  Repository,
  AnalysisResult,
  DevOpsBlueprint,
  GeneratedArtifact,
  PipelineExecution,
  SecurityOverview,
} from '@/types';
import { formatDate, formatDuration } from '@/lib/utils';

export const RepositoryDetailPage: React.FC = () => {
  const { repositoryId = 'repo-unified-devops' } = useParams<{ repositoryId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [repo, setRepo] = useState<Repository | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [blueprints, setBlueprints] = useState<DevOpsBlueprint[]>([]);
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
  const [pipelines, setPipelines] = useState<PipelineExecution[]>([]);
  const [security, setSecurity] = useState<SecurityOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRepoData() {
      try {
        setLoading(true);
        const [rRes, aRes, bRes, artRes, pRes, sRes] = await Promise.all([
          repositoryService.getRepositoryById(repositoryId),
          analysisService.getAnalysis(repositoryId),
          blueprintService.getBlueprintsByRepo(repositoryId),
          artifactService.getArtifactsByRepo(repositoryId),
          pipelineService.getPipelines(),
          securityService.getSecurityOverview(repositoryId),
        ]);
        setRepo(rRes.data);
        setAnalysis(aRes.data);
        setBlueprints(bRes.data);
        setArtifacts(artRes.data);
        setPipelines(pRes.data.filter((p) => p.repositoryId === repositoryId));
        setSecurity(sRes.data);
      } finally {
        setLoading(false);
      }
    }
    loadRepoData();
  }, [repositoryId]);

  if (!repo && !loading) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-border">
        <p className="text-xs text-slate-500">Repository not found.</p>
        <Link to="/app/repositories">
          <Button variant="secondary" size="sm" className="mt-4">
            Back to Repositories
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analysis', label: 'Evidence & Analysis' },
    { id: 'blueprints', label: 'Blueprints', badge: blueprints.length },
    { id: 'artifacts', label: 'Artifacts', badge: artifacts.length },
    { id: 'pipelines', label: 'Pipelines', badge: pipelines.length },
    { id: 'security', label: 'Security & Gates' },
    { id: 'settings', label: 'Repo Settings' },
  ];

  return (
    <div className="space-y-5">
      {/* Scope Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/app/repositories" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <GitBranch className="w-4 h-4 text-primary-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {repo?.fullName || 'unified-devops-automation'}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {repo?.defaultBranch || 'main'}
            </span>
            <StatusPill status={repo?.blueprintStatus || 'approved'} />
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">{repo?.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to={`/app/analyze?repoId=${repo?.id}`}>
            <Button variant="secondary" size="sm" leftIcon={<SearchCode className="w-3.5 h-3.5 text-primary-600" />}>
              Run Analyzer
            </Button>
          </Link>
          <a href={repo?.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3 h-3" />}>
              GitHub Repo
            </Button>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-4">
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                <CardTitle>DevOps Readiness Profile</CardTitle>
                <span className="font-mono text-[11px] text-slate-400">Fingerprint: Verified</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded bg-surface-subtle border border-border">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Framework</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {analysis?.detectedStack.framework || 'React 18 + Vite'}
                  </p>
                </div>
                <div className="p-2.5 rounded bg-surface-subtle border border-border">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Runtime</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {analysis?.detectedStack.runtime || 'Node.js 22'}
                  </p>
                </div>
                <div className="p-2.5 rounded bg-surface-subtle border border-border">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Container Spec</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1">Ready</p>
                </div>
                <div className="p-2.5 rounded bg-surface-subtle border border-border">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">K8s Deployment</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1">Ready</p>
                </div>
              </div>

              <div className="p-3 rounded bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Approved Blueprint Active:</strong> Pipeline triggers on push to <span className="font-mono font-semibold">main</span> and executes quality gates, multi-stage Docker build, GHCR publishing, and Kubernetes deployment.
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader className="py-2.5">
                <CardTitle>Recent Commit & Branch History</CardTitle>
                <span className="text-[11px] font-mono text-slate-400">git log</span>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/60">
                <div className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900">b3f939e</span>
                    <span className="text-slate-700 ml-2">feat(core): implement explainable blueprint approval gate</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">2 hours ago</span>
                </div>
                <div className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900">8f2d011</span>
                    <span className="text-slate-700 ml-2">fix(deps): bump dependencies and add testing suite</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">1 day ago</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4 space-y-2.5 text-xs">
              <CardTitle className="text-xs">Target Environment</CardTitle>
              <div className="flex justify-between py-1 border-b border-border/70">
                <span className="text-slate-500">Namespace</span>
                <span className="font-mono font-semibold text-slate-800">devops-control-plane</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/70">
                <span className="text-slate-500">Pod Replicas</span>
                <span className="font-mono text-emerald-700 font-semibold">3 / 3 Ready</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/70">
                <span className="text-slate-500">Container Registry</span>
                <span className="font-mono text-slate-800">ghcr.io</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Security Gate</span>
                <span className="text-emerald-700 font-semibold">Trivy Zero-Critical</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Analysis */}
      {activeTab === 'analysis' && analysis && (
        <Card>
          <CardHeader className="py-2.5">
            <CardTitle>Fingerprint Rules & Source Evidence</CardTitle>
            <span className="font-mono text-[11px] text-slate-400">Certainty: {analysis.confidenceScore}%</span>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>File Reference</th>
                  <th>Rule & Snippet</th>
                  <th className="text-right">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {analysis.evidence.map((ev, i) => (
                  <tr key={i}>
                    <td className="capitalize font-medium text-slate-700">
                      {ev.category.replace('_', ' ')}
                    </td>
                    <td className="font-mono font-bold text-slate-900 text-xs">
                      {ev.file}
                    </td>
                    <td>
                      <span className="font-semibold text-primary-600 block text-xs">
                        {ev.matchedRule}
                      </span>
                      {ev.snippet && (
                        <code className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                          {ev.snippet}
                        </code>
                      )}
                    </td>
                    <td className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ev.confidence.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Blueprints */}
      {activeTab === 'blueprints' && (
        <div className="space-y-3">
          {blueprints.map((bp) => (
            <Card key={bp.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">{bp.version}</span>
                  <StatusPill status={bp.status} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stack: {bp.stack} • Target: {bp.deploymentTarget}
                </p>
              </div>
              <Link to={`/app/blueprints/${bp.id}`}>
                <Button variant="secondary" size="xs">
                  Inspect Spec
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 4: Artifacts */}
      {activeTab === 'artifacts' && (
        <div className="space-y-4">
          {artifacts.map((art) => (
            <CodeViewer
              key={art.id}
              code={art.content}
              filename={art.filename}
              language={art.language}
            />
          ))}
        </div>
      )}

      {/* Tab 5: Pipelines */}
      {activeTab === 'pipelines' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-left data-table">
              <thead>
                <tr>
                  <th>Build #</th>
                  <th>Commit Message</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pipelines.map((pipe) => (
                  <tr key={pipe.id}>
                    <td className="font-mono font-bold text-slate-900 text-xs">
                      #{pipe.buildNumber}
                    </td>
                    <td className="text-xs text-slate-700 truncate max-w-md">
                      {pipe.commitMessage}
                    </td>
                    <td className="font-mono text-xs text-slate-500">
                      {formatDuration(pipe.durationSeconds)}
                    </td>
                    <td>
                      <StatusPill status={pipe.status} />
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
      )}

      {/* Tab 6: Security */}
      {activeTab === 'security' && security && (
        <Card className="p-4 space-y-3">
          <CardTitle>Repository Security Posture</CardTitle>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded bg-surface-subtle border border-border">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">SonarQube Coverage</span>
              <p className="text-lg font-bold text-emerald-600 mt-1">{security.sonarqube.coverage}%</p>
            </div>
            <div className="p-3 rounded bg-surface-subtle border border-border">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Trivy Zero-Critical Policy</span>
              <p className="text-lg font-bold text-emerald-600 mt-1">Enforced</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 7: Settings */}
      {activeTab === 'settings' && (
        <Card className="p-4 max-w-xl space-y-3 text-xs">
          <CardTitle>Repository Automation Policies</CardTitle>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
            <span>Automatically trigger Jenkins CI/CD on push to main</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
            <span>Require explicit human approval for new DevOps Blueprints</span>
          </label>
        </Card>
      )}
    </div>
  );
};
