import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileCode2,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
  Server,
  Activity,
  Cpu,
  Package,
  ScrollText,
  AlertTriangle,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { StatusPill } from '@/components/common/StatusPill';
import { CodeViewer } from '@/components/common/CodeViewer';
import { blueprintService } from '@/services/blueprintService';
import { artifactService } from '@/services/artifactService';
import { DevOpsBlueprint } from '@/types';
import { BlueprintApprovalModal } from './BlueprintApprovalModal';
import { useToast } from '@/components/common/Toast';
import { formatDate } from '@/lib/utils';

export const BlueprintDetailPage: React.FC = () => {
  const { blueprintId = 'bp-unified-v1' } = useParams<{ blueprintId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [blueprint, setBlueprint] = useState<DevOpsBlueprint | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isGeneratingArtifacts, setIsGeneratingArtifacts] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await blueprintService.getBlueprintById(blueprintId);
      setBlueprint(res.data);
    }
    load();
  }, [blueprintId]);

  if (!blueprint) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-border">
        <p className="text-xs text-slate-500">Loading blueprint specification...</p>
      </div>
    );
  }

  const handleConfirmApproval = async () => {
    try {
      setIsApproving(true);
      const res = await blueprintService.approveBlueprint(blueprint.id);
      setBlueprint(res.data);
      setIsApprovalModalOpen(false);
      toast.success('Blueprint Approved', `${res.data.version} has been approved.`);
    } catch {
      toast.error('Approval failed', 'Unable to approve blueprint version.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleGenerateArtifacts = async () => {
    try {
      setIsGeneratingArtifacts(true);
      await artifactService.regenerateArtifacts(blueprint.id);
      toast.success('Artifacts Generated', 'Jenkinsfile, Dockerfile, and Kubernetes manifests generated.');
      navigate('/app/artifacts');
    } catch {
      toast.error('Error', 'Failed to generate artifacts');
    } finally {
      setIsGeneratingArtifacts(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Scope Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/app/blueprints" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {blueprint.repositoryName} — {blueprint.version}
            </h1>
            <StatusPill status={blueprint.status} />
          </div>
          <p className="text-xs text-slate-500">
            Stack: <strong className="text-slate-700">{blueprint.stack}</strong> • Target: <strong className="text-slate-700">{blueprint.deploymentTarget}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRawJson(!showRawJson)}
          >
            {showRawJson ? 'Structured Spec' : 'Raw JSON'}
          </Button>

          {blueprint.status !== 'approved' ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
              onClick={() => setIsApprovalModalOpen(true)}
            >
              Authorize & Approve
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ScrollText className="w-3.5 h-3.5" />}
              onClick={handleGenerateArtifacts}
              isLoading={isGeneratingArtifacts}
            >
              Generate Artifacts
            </Button>
          )}
        </div>
      </div>

      {/* Immutable Governance Audit Notice */}
      {blueprint.status === 'approved' && (
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-md text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong>Immutable Version Locked:</strong> Approved by {blueprint.approvedBy} on {formatDate(blueprint.approvedAt || blueprint.createdAt)}.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
            sha256-verified
          </span>
        </div>
      )}

      {showRawJson ? (
        <CodeViewer
          code={JSON.stringify(blueprint, null, 2)}
          filename={`blueprint-${blueprint.version}.json`}
          language="json"
        />
      ) : (
        <div className="space-y-5">
          {/* 4 Architectural Spec Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Containerization Spec */}
            <Card>
              <CardHeader className="py-2.5">
                <CardTitle className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-primary-600" />
                  Containerization & Packaging Spec
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs pt-3">
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">Base Image</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {blueprint.config.container.baseImage}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">Build Command</span>
                  <span className="font-mono text-slate-800">
                    {blueprint.config.build.command}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">Target Container Port</span>
                  <span className="font-mono text-slate-800">
                    :{blueprint.config.container.targetPort}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">Multi-Stage Hardening</span>
                  <span className="text-emerald-700 font-semibold">Enabled (non-root runner)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Registry Target</span>
                  <span className="font-mono text-slate-800">
                    {blueprint.config.registry.target}/{blueprint.config.registry.repository}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Kubernetes Workload Spec */}
            <Card>
              <CardHeader className="py-2.5">
                <CardTitle className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Kubernetes Workload Topology
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs pt-3">
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">Namespace</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {blueprint.config.deployment.namespace}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">Pod Replicas</span>
                  <span className="font-mono text-slate-800">
                    {blueprint.config.deployment.replicas} Pods (RollingUpdate)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">Service Exposure</span>
                  <span className="font-mono text-slate-800">
                    {blueprint.config.deployment.serviceType}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">CPU Allocation (req/lim)</span>
                  <span className="font-mono text-slate-800">
                    {blueprint.config.deployment.resources.cpu}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Memory Allocation (req/lim)</span>
                  <span className="font-mono text-slate-800">
                    {blueprint.config.deployment.resources.memory}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Security & Quality Gate Configuration */}
            <Card>
              <CardHeader className="py-2.5">
                <CardTitle className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Quality & Security Gate Thresholds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs pt-3">
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">SonarQube Profile</span>
                  <span className="font-semibold text-slate-800">
                    {blueprint.config.security.sonarqube.qualityGate}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">Trivy Severity Policy</span>
                  <span className="text-rose-700 font-semibold">
                    Halt on {blueprint.config.security.trivy.severityThreshold} CVE
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Image Tagging Pattern</span>
                  <span className="font-mono text-slate-800">
                    {blueprint.config.registry.tagPattern}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Cloud & Observability Spec */}
            <Card>
              <CardHeader className="py-2.5">
                <CardTitle className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  Cloud Infrastructure & Telemetry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs pt-3">
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">Cloud Provider</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {blueprint.config.infrastructure.provider} (Managed AKS)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/70">
                  <span className="text-slate-500">Prometheus Scrape Port</span>
                  <span className="font-mono text-slate-800">
                    :{blueprint.config.observability.prometheusPort}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Grafana Dashboard</span>
                  <span className="font-mono text-slate-800">
                    {blueprint.config.observability.grafanaDashboard}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assumptions & Operational Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-l-2 border-l-primary-600">
              <h3 className="text-xs font-bold text-slate-900 mb-2">Architectural Assumptions</h3>
              <div className="space-y-1.5 text-xs text-slate-600">
                {blueprint.assumptions.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 border-l-2 border-l-amber-500">
              <h3 className="text-xs font-bold text-slate-900 mb-2">Operational Warnings</h3>
              <div className="space-y-1.5 text-xs text-slate-600">
                {blueprint.warnings.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      <BlueprintApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        blueprint={blueprint}
        onConfirmApproval={handleConfirmApproval}
        isLoading={isApproving}
      />
    </div>
  );
};
