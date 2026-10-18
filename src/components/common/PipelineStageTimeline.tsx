import React from 'react';
import { PipelineStage } from '@/types';
import { CheckCircle2, XCircle, Loader2, Clock, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PipelineStageTimelineProps {
  stages: PipelineStage[];
  selectedStageId?: string;
  onSelectStage?: (stageId: string) => void;
  className?: string;
}

export const PipelineStageTimeline: React.FC<PipelineStageTimelineProps> = ({
  stages,
  selectedStageId,
  onSelectStage,
  className,
}) => {
  const getStageIcon = (status: PipelineStage['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'failed':
        return <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
      case 'running':
        return <Loader2 className="w-3.5 h-3.5 text-primary-600 animate-spin shrink-0" />;
      case 'skipped':
        return <MinusCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
      case 'pending':
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
    }
  };

  const getStageStyle = (status: PipelineStage['status'], isSelected: boolean) => {
    if (isSelected) {
      return 'border-primary-600 bg-primary-50/50 text-slate-900 shadow-sm ring-1 ring-primary-500/20';
    }
    switch (status) {
      case 'success':
        return 'border-border bg-white hover:bg-slate-50 text-slate-800';
      case 'failed':
        return 'border-rose-300 bg-rose-50/30 text-rose-900 hover:bg-rose-50/60';
      case 'running':
        return 'border-primary-300 bg-primary-50/20 text-primary-900';
      case 'skipped':
      case 'pending':
      default:
        return 'border-border/60 bg-surface-subtle/70 text-slate-400';
    }
  };

  return (
    <div className={cn('w-full overflow-x-auto pb-1 select-none', className)}>
      <div className="flex items-center min-w-max gap-1.5 py-1">
        {stages.map((stage, idx) => {
          const isSelected = selectedStageId === stage.id;
          return (
            <React.Fragment key={stage.id}>
              <button
                type="button"
                onClick={() => onSelectStage && onSelectStage(stage.id)}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-left transition-all',
                  getStageStyle(stage.status, isSelected)
                )}
              >
                {getStageIcon(stage.status)}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400">
                      {stage.order}
                    </span>
                    <span className="text-xs font-semibold leading-none truncate max-w-[120px]">
                      {stage.name}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5 leading-none">
                    {stage.durationSeconds !== undefined
                      ? `${stage.durationSeconds}s`
                      : stage.status === 'running'
                      ? 'in progress'
                      : stage.status}
                  </div>
                </div>
              </button>

              {idx < stages.length - 1 && (
                <div className="w-2.5 h-[1.5px] bg-border shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
