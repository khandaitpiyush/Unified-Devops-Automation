import React, { useState, useEffect } from 'react';
import {
  Server,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Play,
  Layers,
  Database,
  Cloud,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { infrastructureService } from '@/services/infrastructureService';
import { InfrastructureItem } from '@/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

export const InfrastructurePage: React.FC = () => {
  const [infraList, setInfraList] = useState<InfrastructureItem[]>([]);
  const [selectedInfraId, setSelectedInfraId] = useState<string>('infra-aks-prod');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isRunningPlan, setIsRunningPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await infrastructureService.getInfrastructure();
        setInfraList(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedInfra = infraList.find((i) => i.id === selectedInfraId) || infraList[0];

  const handleRunPlan = async () => {
    if (!selectedInfra) return;
    try {
      setIsRunningPlan(true);
      const res = await infrastructureService.runTerraformPlan(selectedInfra.id);
      toast.success('Terraform Plan Complete', res.data.planOutput);
      setIsPlanModalOpen(false);
    } catch {
      toast.error('Error', 'Failed to execute terraform plan');
    } finally {
      setIsRunningPlan(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Infrastructure & Terraform Workspaces
            </h1>
            <span className="text-[11px] font-mono text-slate-400 bg-surface-subtle px-2 py-0.5 rounded border border-border">
              declarative iac
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud infrastructure provisioning, remote state synchronization, and Kubernetes cluster topology.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Play className="w-3.5 h-3.5 text-primary-600" />}
          onClick={() => setIsPlanModalOpen(true)}
        >
          Run Dry-Run Plan
        </Button>
      </div>

      {/* Workspaces & Cluster Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Workspace Selector List */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-800">Managed Cloud Workspaces</p>
          {infraList.map((infra) => {
            const isSelected = infra.id === selectedInfra?.id;
            return (
              <Card
                key={infra.id}
                onClick={() => setSelectedInfraId(infra.id)}
                className={`p-3.5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50/20 shadow-sm ring-1 ring-primary-500/20'
                    : 'hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cloud className="w-4 h-4 text-primary-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{infra.clusterName}</p>
                      <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">
                        {infra.provider} • {infra.region}
                      </p>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected Workspace Detail (2 columns) */}
        {selectedInfra && (
          <div className="md:col-span-2 space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{selectedInfra.clusterName}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Provider: {selectedInfra.provider} • Region: {selectedInfra.region}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  {selectedInfra.stateStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                <div className="p-2.5 bg-surface-subtle rounded border border-border">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Terraform Version</span>
                  <p className="font-bold text-slate-900 font-mono mt-0.5">
                    v{selectedInfra.terraformVersion}
                  </p>
                </div>
                <div className="p-2.5 bg-surface-subtle rounded border border-border">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Managed Resources</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {selectedInfra.managedResourcesCount} resources
                  </p>
                </div>
                <div className="p-2.5 bg-surface-subtle rounded border border-border">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Last Apply</span>
                  <p className="font-medium text-slate-700 text-[11px] mt-0.5 truncate">
                    {formatDate(selectedInfra.lastApplyAt)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Plan / Apply Execution History */}
            <Card>
              <CardHeader className="py-2.5">
                <CardTitle>Terraform Execution History</CardTitle>
                <span className="text-[11px] text-slate-400 font-mono">state actions</span>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/60">
                {selectedInfra.planHistory.map((h) => (
                  <div key={h.id} className="p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${h.action === 'apply' ? 'bg-primary-50 text-primary-700' : 'bg-slate-100 text-slate-700'}`}>
                          {h.action}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">{formatDate(h.timestamp)}</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +{h.resourcesAdded} ~{h.resourcesChanged} -{h.resourcesDestroyed}
                      </span>
                    </div>
                    <pre className="p-2.5 rounded bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto select-text leading-relaxed">
                      {h.outputSnippet}
                    </pre>
                  </div>
                ))}

                {selectedInfra.planHistory.length === 0 && (
                  <p className="p-6 text-center text-xs text-slate-400">
                    No recorded apply runs for this workspace yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onConfirm={handleRunPlan}
        title="Execute Terraform Plan?"
        message={`Execute dry-run configuration plan for "${selectedInfra?.clusterName}" against remote state? No cloud resources will be altered during a plan operation.`}
        confirmText="Run Plan"
        variant="primary"
        isLoading={isRunningPlan}
      />
    </div>
  );
};
