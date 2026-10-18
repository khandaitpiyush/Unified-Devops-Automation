import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  SearchCode,
  Sparkles,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Loader2,
  FileText,
  Terminal,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { repositoryService } from '@/services/repositoryService';
import { analysisService } from '@/services/analysisService';
import { blueprintService } from '@/services/blueprintService';
import { Repository, AnalysisResult } from '@/types';
import { useToast } from '@/components/common/Toast';

export const AnalyzerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const repoIdParam = searchParams.get('repoId') || 'repo-unified-devops';
  const navigate = useNavigate();
  const toast = useToast();

  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState(repoIdParam);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);

  useEffect(() => {
    async function loadRepos() {
      const res = await repositoryService.getRepositories();
      setRepos(res.data);
      if (res.data.length > 0 && !selectedRepoId) {
        setSelectedRepoId(res.data[0].id);
      }
    }
    loadRepos();
  }, []);

  useEffect(() => {
    if (selectedRepoId) {
      loadAnalysis(selectedRepoId);
    }
  }, [selectedRepoId]);

  const loadAnalysis = async (repoId: string) => {
    try {
      const res = await analysisService.getAnalysis(repoId);
      setAnalysis(res.data);
    } catch {
      setAnalysis(null);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const res = await analysisService.triggerAnalysis(selectedRepoId);
      setAnalysis(res.data);
      toast.success('Analysis Completed', `Identified ${res.data.detectedStack.framework} stack.`);
    } catch {
      toast.error('Analysis failed', 'Unable to complete repository evidence scan.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateBlueprint = async () => {
    if (!analysis) return;
    try {
      setIsGeneratingBlueprint(true);
      const selectedRepo = repos.find((r) => r.id === selectedRepoId);
      const newBp = await blueprintService.createBlueprint({
        repositoryId: selectedRepoId,
        repositoryName: selectedRepo?.name || 'repo',
        stack: `${analysis.detectedStack.framework} (${analysis.detectedStack.runtime})`,
        deploymentTarget: 'Kubernetes (Azure AKS)',
      });
      toast.success('DevOps Blueprint Generated', `Draft ${newBp.data.version} created for review.`);
      navigate(`/app/blueprints/${newBp.data.id}`);
    } catch {
      toast.error('Error', 'Failed to generate blueprint');
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const selectedRepo = repos.find((r) => r.id === selectedRepoId);

  return (
    <div className="space-y-6">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Repository Analyzer</h1>
            <span className="text-[11px] font-mono text-slate-400 bg-surface-subtle px-2 py-0.5 rounded border border-border">
              evidence-engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspects repository artifacts, package manifests, and scripts to create an explainable DevOps blueprint.
          </p>
        </div>

        {/* Repository Selector Dropdown & Run CTA */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md border border-border bg-white text-slate-800 focus-ring shadow-subtle min-w-[200px]"
          >
            {repos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.language})
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRunAnalysis}
            isLoading={isAnalyzing}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            {isAnalyzing ? 'Scanning...' : 'Run Analysis'}
          </Button>
        </div>
      </div>

      {isAnalyzing && (
        <Card className="p-10 text-center bg-white space-y-3">
          <Loader2 className="w-7 h-7 text-primary-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-900">
            Analyzing {selectedRepo?.fullName}...
          </p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Extracting package manifests, lockfile versions, test scripts, container configs, and Kubernetes targets.
          </p>
        </Card>
      )}

      {!isAnalyzing && analysis && (
        <div className="space-y-5">
          {/* Executive Assessment Verdict Banner */}
          <div className="bg-white rounded-lg border border-border p-4 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <h2 className="text-sm font-bold text-slate-900">
                  Assessment Complete: {analysis.detectedStack.framework}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {analysis.confidenceScore}% Certainty
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Recommended Architecture Template: <strong className="font-mono text-slate-700">{analysis.recommendedBlueprintTemplate}</strong>
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateBlueprint}
              isLoading={isGeneratingBlueprint}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Synthesize Blueprint
            </Button>
          </div>

          {/* 4 Concrete Inspection Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Framework & Runtime
                </span>
                <Layers className="w-4 h-4 text-primary-600" />
              </div>
              <p className="text-xs font-bold text-slate-900 mt-2">
                {analysis.detectedStack.framework}
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {analysis.detectedStack.runtime}
              </p>
            </Card>

            <Card className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Package Manager
                </span>
                <Package className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xs font-bold text-slate-900 mt-2">
                {analysis.packageManager.name}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Lockfile: {analysis.packageManager.lockfilePresent ? 'Verified (v3)' : 'Missing'}
              </p>
            </Card>

            <Card className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Detected Scripts
                </span>
                <Code2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-slate-900 mt-2">
                {Object.keys(analysis.scripts).length} Executable Tasks
              </p>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
                build, test, lint
              </p>
            </Card>

            <Card className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Existing DevOps Config
                </span>
                <FileCheck className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs font-bold text-slate-900 mt-2">
                {analysis.existingConfig.hasDockerfile ? 'Dockerfile Present' : 'No Dockerfile'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                K8s: {analysis.existingConfig.hasKubernetes ? 'Detected' : 'Manifests Needed'}
              </p>
            </Card>
          </div>

          {/* Evidence Fingerprints Table */}
          <Card>
            <CardHeader className="py-2.5">
              <div>
                <CardTitle>Deterministic Evidence Fingerprints</CardTitle>
                <p className="text-[11px] text-slate-400">
                  Concrete source files, matched rules, and code snippets supporting this determination
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>File Reference</th>
                    <th>Fingerprint Rule & Matched Snippet</th>
                    <th className="text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.evidence.map((ev, index) => (
                    <tr key={index}>
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

          {/* Missing Requirements & Architectural Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-l-2 border-l-amber-500">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900">Missing Requirements & Gaps</h3>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                {analysis.missingRequirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 border-l-2 border-l-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Security & Operational Advice</h3>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                {analysis.warnings.map((warn, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
