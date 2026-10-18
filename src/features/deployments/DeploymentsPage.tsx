import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Activity,
  Server,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { StatusPill } from '@/components/common/StatusPill';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { deploymentService } from '@/services/deploymentService';
import { DeploymentItem } from '@/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

export const DeploymentsPage: React.FC = () => {
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentItem | null>(null);
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await deploymentService.getDeployments();
        setDeployments(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRollbackClick = (dep: DeploymentItem) => {
    setSelectedDeployment(dep);
    setIsRollbackModalOpen(true);
  };

  const handleConfirmRollback = async () => {
    try {
      setIsRollingBack(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.warning(
        'Backend Action Required',
        'Rollback request requires Kubernetes API integration with active cluster permissions.'
      );
      setIsRollbackModalOpen(false);
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Deployment Fleet Management
            </h1>
            <span className="text-[11px] font-mono text-slate-400 bg-surface-subtle px-2 py-0.5 rounded border border-border">
              kubernetes workloads
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active container deployments, pod replica readiness, service endpoints, and cluster event telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-2.5 py-1.5 rounded-md border border-border shadow-subtle">
          <Server className="w-3.5 h-3.5 text-primary-600" />
          <span>Cluster: <strong className="text-slate-900 font-mono">aks-devops-eastus-01</strong></span>
        </div>
      </div>

      {/* Workload Deployments Table */}
      <Card>
        <CardHeader className="py-2.5">
          <CardTitle>Active Kubernetes Deployments</CardTitle>
          <span className="text-[11px] font-mono text-slate-400">
            {deployments.length} managed workloads
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Service & Environment</th>
                <th>Namespace</th>
                <th>Container Image Tag</th>
                <th>Pod Replicas Ready</th>
                <th>Blueprint Version</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map((dep) => (
                <tr key={dep.id}>
                  <td>
                    <span className="font-bold text-slate-900 text-xs">
                      {dep.repositoryName}
                    </span>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {dep.environment}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {dep.commitSha}
                      </span>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-slate-700">{dep.namespace}</td>
                  <td className="font-mono text-[11px] text-slate-500">{dep.imageTag}</td>
                  <td>
                    <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {dep.replicas.ready} / {dep.replicas.desired} Ready
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] text-slate-600">
                      {dep.blueprintVersion}
                    </span>
                  </td>
                  <td>
                    <StatusPill status={dep.status} />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="xs"
                        leftIcon={<RotateCcw className="w-3 h-3" />}
                        onClick={() => handleRollbackClick(dep)}
                      >
                        Rollback
                      </Button>
                      <Link to={`/app/pipelines/${dep.pipelineId}`}>
                        <Button variant="secondary" size="xs">
                          Pipeline
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Cluster Event Stream */}
      <Card>
        <CardHeader className="py-2.5">
          <div>
            <CardTitle>Kubernetes Cluster Events Log</CardTitle>
            <p className="text-[11px] text-slate-400">Live operational events recorded from cluster control plane</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Reason</th>
                <th>Message Description</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {deployments.flatMap((d) => d.events).map((evt, idx) => (
                <tr key={idx}>
                  <td>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        evt.type === 'Warning'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {evt.type}
                    </span>
                  </td>
                  <td className="font-mono font-bold text-slate-800 text-xs">
                    {evt.reason}
                  </td>
                  <td className="text-xs text-slate-700">
                    {evt.message}
                  </td>
                  <td className="font-mono text-[10px] text-slate-400">
                    {formatDate(evt.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={isRollbackModalOpen}
        onClose={() => setIsRollbackModalOpen(false)}
        onConfirm={handleConfirmRollback}
        title={`Rollback ${selectedDeployment?.repositoryName}?`}
        message={`Are you sure you want to rollback to the previous Kubernetes revision for namespace "${selectedDeployment?.namespace}"? This operation triggers an in-cluster rollout undo.`}
        confirmText="Initiate Rollback"
        variant="danger"
        isLoading={isRollingBack}
      />
    </div>
  );
};
