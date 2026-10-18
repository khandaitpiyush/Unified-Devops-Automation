import React from 'react';
import {
  Rocket,
  Clock,
  AlertTriangle,
  RotateCcw,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/common/Card';

export interface DoraMetricsGridProps {
  deploymentFrequency?: string;
  leadTime?: string;
  changeFailureRate?: string;
  mttr?: string;
  readyReplicas?: number;
  totalReplicas?: number;
  cpuPercent?: number;
  memoryPercent?: number;
}

export const DoraMetricsGrid: React.FC<DoraMetricsGridProps> = ({
  deploymentFrequency = '4.8 / day',
  leadTime = '14m 32s',
  changeFailureRate = '1.8%',
  mttr = '8m 40s',
  readyReplicas = 3,
  totalReplicas = 3,
  cpuPercent = 28,
  memoryPercent = 41,
}) => {
  return (
    <div className="space-y-3">
      {/* Top Banner / DORA Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            DevOps & DORA Performance Benchmarks
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Elite Tier
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Rolling 30-day telemetry window
        </span>
      </div>

      {/* 4 DORA Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Deployment Frequency */}
        <Card className="p-3.5 relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Deployment Frequency
            </span>
            <div className="w-7 h-7 rounded-md bg-primary-50 text-primary-600 flex items-center justify-center">
              <Rocket className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {deploymentFrequency}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +18%
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Multiple deploys daily</span>
            <span className="font-mono text-emerald-600 font-semibold">Elite</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
            <div className="bg-primary-600 h-full w-[88%]" />
          </div>
        </Card>

        {/* Metric 2: Lead Time for Changes */}
        <Card className="p-3.5 relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Lead Time for Changes
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 tracking-tight">{leadTime}</span>
            <span className="text-[10px] text-slate-400">commit → prod</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>&lt; 1 hour automated gate</span>
            <span className="font-mono text-emerald-600 font-semibold">Elite</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[92%]" />
          </div>
        </Card>

        {/* Metric 3: Change Failure Rate */}
        <Card className="p-3.5 relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Change Failure Rate
            </span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {changeFailureRate}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Target &lt; 5%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Trivy/Sonar gate policy</span>
            <span className="font-mono text-emerald-600 font-semibold">Elite</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full w-[15%]" />
          </div>
        </Card>

        {/* Metric 4: Mean Time to Recovery (MTTR) */}
        <Card className="p-3.5 relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Mean Time to Restore
            </span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 tracking-tight">{mttr}</span>
            <span className="text-[10px] text-slate-400">auto-rollback</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Canary abort &lt; 10 min</span>
            <span className="font-mono text-emerald-600 font-semibold">Elite</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
            <div className="bg-blue-600 h-full w-[90%]" />
          </div>
        </Card>
      </div>

      {/* Cluster & Workload Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="px-3.5 py-2.5 rounded-lg border border-border bg-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-600" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Workload Pods
              </p>
              <p className="font-mono font-bold text-slate-900">
                {readyReplicas}/{totalReplicas} Pods Running
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            100% Ready
          </span>
        </div>

        <div className="px-3.5 py-2.5 rounded-lg border border-border bg-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Cluster vCPU
              </p>
              <p className="font-mono font-bold text-slate-900">{cpuPercent}% of 2000m</p>
            </div>
          </div>
          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${cpuPercent}%` }} />
          </div>
        </div>

        <div className="px-3.5 py-2.5 rounded-lg border border-border bg-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Memory Quota
              </p>
              <p className="font-mono font-bold text-slate-900">{memoryPercent}% of 1024MiB</p>
            </div>
          </div>
          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-500 h-full" style={{ width: `${memoryPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
