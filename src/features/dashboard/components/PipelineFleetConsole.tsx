import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlaySquare,
  ArrowRight,
  Terminal,
  GitBranch,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { StatusPill } from '@/components/common/StatusPill';
import { Button } from '@/components/common/Button';
import { PipelineExecution } from '@/types';
import { formatDuration, formatDate } from '@/lib/utils';

export interface PipelineFleetConsoleProps {
  pipelines: PipelineExecution[];
  onTriggerModal: () => void;
  onOpenTerminal: (buildNumber?: number) => void;
}

export const PipelineFleetConsole: React.FC<PipelineFleetConsoleProps> = ({
  pipelines,
  onTriggerModal,
  onOpenTerminal,
}) => {
  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center gap-2">
          <PlaySquare className="w-4 h-4 text-primary-600" />
          <div>
            <CardTitle>Autonomous CI/CD Pipeline Fleet</CardTitle>
            <p className="text-[11px] text-slate-400">
              9-stage automated delivery pipeline with quality gates, container packaging, and Kubernetes deployment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="xs"
            onClick={onTriggerModal}
            leftIcon={<PlaySquare className="w-3.5 h-3.5 text-primary-600" />}
          >
            Dispatch Build
          </Button>
          <Link
            to="/app/pipelines"
            className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 ml-1"
          >
            Fleet History <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Build & Repository</th>
                <th>Branch & Commit</th>
                <th>9-Stage Progression</th>
                <th>Execution Time</th>
                <th>Gate Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pipelines.map((pipe) => (
                <tr key={pipe.id} className="hover:bg-slate-50/70 transition-colors">
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                        #{pipe.buildNumber}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs truncate max-w-[140px]">
                        {pipe.repositoryName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[210px] mt-0.5">
                      {pipe.commitMessage}
                    </p>
                  </td>

                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-subtle text-slate-700 border border-border">
                        {pipe.branch}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {pipe.commitSha}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize mt-0.5 block">
                      via {pipe.triggerSource.replace('_', ' ')}
                    </span>
                  </td>

                  <td>
                    {/* Visual 9-stage progression track */}
                    <div className="flex items-center gap-1">
                      {pipe.stages.map((stg) => (
                        <div
                          key={stg.id}
                          className={`w-2.5 h-2.5 rounded-sm transition-all ${
                            stg.status === 'success'
                              ? 'bg-emerald-500'
                              : stg.status === 'failed'
                              ? 'bg-rose-500 ring-2 ring-rose-200'
                              : stg.status === 'running'
                              ? 'bg-primary-500 animate-pulse'
                              : 'bg-slate-200'
                          }`}
                          title={`Stage ${stg.order}: ${stg.name} (${stg.status})`}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                      {pipe.stages.filter((s) => s.status === 'success').length}/9 Stages Complete
                    </span>
                  </td>

                  <td>
                    <div className="flex items-center gap-1 text-slate-700 font-mono text-xs">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatDuration(pipe.durationSeconds)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{formatDate(pipe.startTime)}</p>
                  </td>

                  <td>
                    <StatusPill status={pipe.status} />
                  </td>

                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onOpenTerminal(pipe.buildNumber)}
                        leftIcon={<Terminal className="w-3 h-3 text-slate-500" />}
                        title="Stream Build Output"
                      >
                        Logs
                      </Button>

                      <Link to={`/app/pipelines/${pipe.id}`}>
                        <Button variant="outline" size="xs">
                          Inspect
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
