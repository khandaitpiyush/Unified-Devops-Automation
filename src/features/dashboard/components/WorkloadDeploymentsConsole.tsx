import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  RotateCcw,
  Plus,
  Minus,
  ExternalLink,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { StatusPill } from '@/components/common/StatusPill';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DeploymentItem } from '@/types';
import { deploymentService } from '@/services/deploymentService';
import { useToast } from '@/components/common/Toast';

export interface WorkloadDeploymentsConsoleProps {
  deployments: DeploymentItem[];
  onRefresh: () => void;
  onOpenTerminal: () => void;
}

export const WorkloadDeploymentsConsole: React.FC<WorkloadDeploymentsConsoleProps> = ({
  deployments,
  onRefresh,
  onOpenTerminal,
}) => {
  const [scalingId, setScalingId] = useState<string | null>(null);
  const [rollbackItem, setRollbackItem] = useState<DeploymentItem | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const toast = useToast();

  const handleScale = async (dep: DeploymentItem, delta: number) => {
    const current = dep.replicas.desired;
    const target = Math.max(1, Math.min(10, current + delta));
    if (target === current) return;

    try {
      setScalingId(dep.id);
      await deploymentService.scaleDeployment(dep.id, target);
      toast.success(
        'Replica Scaling Applied',
        `Scaled ${dep.repositoryName} from ${current} to ${target} pods.`
      );
      onRefresh();
    } catch {
      toast.error('Scaling Failed', 'Unable to apply Kubernetes replica scaling.');
    } finally {
      setScalingId(null);
    }
  };

  const handleRollbackConfirm = async () => {
    if (!rollbackItem) return;
    try {
      setIsRollingBack(true);
      await deploymentService.rollbackDeployment(rollbackItem.id);
      toast.success(
        'Rollback Executed',
        `Reverted ${rollbackItem.repositoryName} to previous stable container release.`
      );
      setRollbackItem(null);
      onRefresh();
    } catch {
      toast.error('Rollback Failed', 'Unable to initiate deployment rollback.');
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-600" />
            <div>
              <CardTitle>Kubernetes Workload Rollouts & Replica Management</CardTitle>
              <p className="text-[11px] text-slate-400">
                Live Pod replicas, traffic routing, container tags, and instantaneous rollbacks.
              </p>
            </div>
          </div>
          <Link
            to="/app/deployments"
            className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            All Deployments <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left data-table">
              <thead>
                <tr>
                  <th>Workload Service</th>
                  <th>Target Namespace</th>
                  <th>Image Tag & Digest</th>
                  <th>Live Pod Replicas</th>
                  <th>Rollout Status</th>
                  <th className="text-right">Interactive Actions</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50/70 transition-colors">
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                          <Server className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">
                            {dep.repositoryName}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-slate-500">
                            {dep.environment}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="font-mono text-xs text-slate-700 bg-surface-subtle px-2 py-0.5 rounded border border-border">
                        {dep.namespace}
                      </span>
                    </td>

                    <td>
                      <div className="font-mono text-xs text-slate-800 font-medium">
                        {dep.imageTag}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[140px]">
                        sha256:{dep.commitSha}
                      </span>
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        {/* Interactive Scale Controls */}
                        <div className="inline-flex items-center rounded-lg border border-border bg-white shadow-xs p-0.5">
                          <button
                            onClick={() => handleScale(dep, -1)}
                            disabled={dep.replicas.desired <= 1 || scalingId === dep.id}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Scale down 1 replica"
                            aria-label="Scale down replica"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono text-xs font-bold text-slate-900 min-w-[28px] text-center">
                            {dep.replicas.ready}/{dep.replicas.desired}
                          </span>
                          <button
                            onClick={() => handleScale(dep, 1)}
                            disabled={dep.replicas.desired >= 10 || scalingId === dep.id}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Scale up 1 replica"
                            aria-label="Scale up replica"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    <td>
                      <StatusPill status={dep.status} />
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Logs Button */}
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={onOpenTerminal}
                          leftIcon={<Terminal className="w-3 h-3 text-slate-500" />}
                          title="Stream Pod logs"
                        >
                          Logs
                        </Button>

                        {/* Rollback Button */}
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setRollbackItem(dep)}
                          leftIcon={<RotateCcw className="w-3 h-3 text-amber-600" />}
                          title="Revert to previous container build"
                        >
                          Rollback
                        </Button>

                        {/* Endpoints Link */}
                        {dep.endpoints && dep.endpoints[0] && (
                          <a
                            href={dep.endpoints[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Open Ingress URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rollback Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(rollbackItem)}
        onClose={() => setRollbackItem(null)}
        onConfirm={handleRollbackConfirm}
        title={`Rollback Workload: ${rollbackItem?.repositoryName}`}
        message={`This will trigger an instantaneous zero-downtime rolling update to the previous stable release. Traffic will be diverted automatically.`}
        confirmText="Confirm Rollback"
        variant="danger"
        isLoading={isRollingBack}
      />
    </>
  );
};
