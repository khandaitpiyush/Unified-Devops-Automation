import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PlaySquare,
  Terminal,
  ShieldCheck,
  Package,
  Layers,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { StatusPill } from '@/components/common/StatusPill';
import { PipelineStageTimeline } from '@/components/common/PipelineStageTimeline';
import { pipelineService } from '@/services/pipelineService';
import { PipelineExecution, PipelineStage } from '@/types';
import { formatDate, formatDuration } from '@/lib/utils';

export const PipelineDetailPage: React.FC = () => {
  const { pipelineId = 'pipe-exec-42' } = useParams<{ pipelineId: string }>();
  const [pipeline, setPipeline] = useState<PipelineExecution | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string>('stg-1');
  const [logFilter, setLogFilter] = useState('');
  const [copiedDigest, setCopiedDigest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await pipelineService.getPipelineById(pipelineId);
        setPipeline(res.data);
        if (res.data?.stages && res.data.stages.length > 0) {
          const failedStage = res.data.stages.find((s) => s.status === 'failed');
          setSelectedStageId(failedStage ? failedStage.id : res.data.stages[0].id);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pipelineId]);

  if (!pipeline && !loading) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-border">
        <p className="text-xs text-slate-500">Pipeline execution not found.</p>
        <Link to="/app/pipelines">
          <Button variant="secondary" size="sm" className="mt-4">
            Back to Pipelines
          </Button>
        </Link>
      </div>
    );
  }

  const selectedStage = pipeline?.stages.find((s) => s.id === selectedStageId) || pipeline?.stages[0];

  const filteredLogs = (selectedStage?.logs || []).filter((l) =>
    l.toLowerCase().includes(logFilter.toLowerCase())
  );

  const handleCopyDigest = (digest: string) => {
    navigator.clipboard.writeText(digest);
    setCopiedDigest(true);
    setTimeout(() => setCopiedDigest(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Scope Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/app/pipelines" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Build #{pipeline?.buildNumber} — {pipeline?.repositoryName}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {pipeline?.branch}
            </span>
            <StatusPill status={pipeline?.status || 'success'} />
          </div>
          <p className="text-xs text-slate-500">
            Commit: <strong className="font-mono text-slate-700">{pipeline?.commitSha}</strong> — "{pipeline?.commitMessage}"
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
          <div className="text-right">
            <p className="font-mono text-xs font-semibold text-slate-800">
              Duration: {pipeline && formatDuration(pipeline.durationSeconds)}
            </p>
            <p className="text-[10px] text-slate-400">{pipeline && formatDate(pipeline.startTime)}</p>
          </div>
        </div>
      </div>

      {/* 9-Stage Visual Stepper */}
      {pipeline && (
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Pipeline Stage Flow
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Click stage to switch stdout logs
            </span>
          </div>
          <PipelineStageTimeline
            stages={pipeline.stages}
            selectedStageId={selectedStageId}
            onSelectStage={setSelectedStageId}
          />
        </Card>
      )}

      {/* Stage Failure Callout */}
      {selectedStage?.status === 'failed' && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Stage Halt: {selectedStage.name}</p>
            <p className="text-rose-800">
              {selectedStage.failureReason || 'Process exited with non-zero exit code.'}
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout: Terminal Logs & Verification Gates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Terminal Logs (2 columns) */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="overflow-hidden border-slate-800">
            {/* Terminal Header with search */}
            <div className="bg-slate-950 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-200 font-semibold">{selectedStage?.name}</span>
                <span className="text-[10px] text-slate-500 uppercase">
                  (exit status: {selectedStage?.status})
                </span>
              </div>

              <div className="relative max-w-xs">
                <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="pl-6 pr-2 py-0.5 text-[11px] bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-slate-600 font-mono"
                />
              </div>
            </div>

            {/* Terminal Output */}
            <div className="bg-[#0B0F19] p-3.5 font-mono text-[11px] text-slate-300 max-h-[460px] overflow-y-auto select-text leading-relaxed space-y-1">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, i) => {
                  const isError = log.includes('CRITICAL') || log.includes('ABORTED') || log.includes('Failed');
                  const isSuccess = log.includes('PASSED') || log.includes('SUCCESS') || log.includes('Successfully');
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-slate-600 select-none text-[10px] shrink-0 min-w-[20px]">
                        {i + 1}
                      </span>
                      <span className={isError ? 'text-rose-400 font-semibold' : isSuccess ? 'text-emerald-400 font-medium' : 'text-slate-300'}>
                        {log}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-600 italic">No output matches the current log filter.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Quality, Security & Rollout Summary (1 column) */}
        <div className="space-y-4">
          {/* Quality & Security Gates */}
          <Card>
            <CardHeader className="py-2.5">
              <CardTitle>Delivery Policy Gates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs pt-3">
              <div className="p-2.5 rounded-md bg-surface-subtle border border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">SonarQube Coverage</p>
                  <p className="text-[10px] text-slate-500">Quality profile gate</p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  PASSED (92.4%)
                </span>
              </div>

              <div className="p-2.5 rounded-md bg-surface-subtle border border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Trivy CVE Policy</p>
                  <p className="text-[10px] text-slate-500">Zero-critical requirement</p>
                </div>
                <span className={pipeline?.securityScan?.blockedDeployment ? 'font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200' : 'font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200'}>
                  {pipeline?.securityScan?.blockedDeployment ? 'BLOCKED' : 'PASSED'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Container Registry Artifact */}
          {pipeline?.imageArtifact && (
            <Card>
              <CardHeader className="py-2.5">
                <CardTitle className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-primary-600" />
                  Published Container Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs pt-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Image Tag</span>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5">
                    {pipeline.imageArtifact.imageTag}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Registry URL</span>
                  <p className="font-mono text-slate-600 mt-0.5">{pipeline.imageArtifact.registry}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Digest</span>
                  <div className="flex items-center justify-between gap-2 mt-0.5 bg-surface-subtle p-1.5 rounded border border-border font-mono text-[10px] text-slate-600">
                    <span className="truncate">{pipeline.imageArtifact.digest}</span>
                    <button
                      onClick={() => handleCopyDigest(pipeline.imageArtifact!.digest)}
                      className="p-1 hover:text-slate-900 text-slate-400 shrink-0"
                      title="Copy digest"
                    >
                      {copiedDigest ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deployment Outcome */}
          {pipeline?.deploymentOutcome && (
            <Card>
              <CardHeader className="py-2.5">
                <CardTitle className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Cluster Rollout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs pt-3">
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">Environment</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {pipeline.deploymentOutcome.environment}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">Namespace</span>
                  <span className="font-mono text-slate-800">
                    {pipeline.deploymentOutcome.namespace}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Rollout Status</span>
                  <span className="font-bold text-emerald-700 uppercase">
                    {pipeline.deploymentOutcome.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
