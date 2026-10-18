import React from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  PlaySquare,
  SearchCode,
  FileCode2,
  ScrollText,
  ShieldCheck,
  Terminal,
  ExternalLink,
  ChevronDown,
  Server,
  Sparkles,
  Github,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { StatusPill } from '@/components/common/StatusPill';
import { Repository } from '@/types';

export interface WorkspaceRepoSelectorProps {
  repositories: Repository[];
  selectedRepoId: string;
  onSelectRepo: (repoId: string) => void;
  onTriggerPipeline: () => void;
  onOpenManifests: () => void;
  onToggleTerminal: () => void;
  terminalOpen: boolean;
}

export const WorkspaceRepoSelector: React.FC<WorkspaceRepoSelectorProps> = ({
  repositories,
  selectedRepoId,
  onSelectRepo,
  onTriggerPipeline,
  onOpenManifests,
  onToggleTerminal,
  terminalOpen,
}) => {
  const currentRepo = repositories.find((r) => r.id === selectedRepoId) || repositories[0];

  return (
    <div className="bg-white border border-border rounded-xl p-4 shadow-subtle space-y-3.5">
      {/* Top Row: Repository Switcher + Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Repository Dropdown Selector & Main Identity */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select
              value={selectedRepoId}
              onChange={(e) => onSelectRepo(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 text-xs font-bold text-slate-900 bg-surface-subtle hover:bg-slate-100 rounded-lg border border-border cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {repositories.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fullName}
                </option>
              ))}
            </select>
            <Github className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick branch pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
            <GitBranch className="w-3 h-3 text-slate-500" />
            <span>{currentRepo?.defaultBranch || 'main'}</span>
          </div>

          {/* Stack Badge */}
          <span className="text-[11px] font-semibold text-slate-600 px-2 py-0.5 rounded bg-surface-subtle border border-border">
            {currentRepo?.language || 'TypeScript'}
          </span>

          {/* Status Pill */}
          <StatusPill status={currentRepo?.latestDeploymentStatus || 'healthy'} />

          {/* Link to actual GitHub */}
          {currentRepo?.url && (
            <a
              href={currentRepo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
              title="Open repository on GitHub"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Action Button Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dispatch Pipeline Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onTriggerPipeline}
            leftIcon={<PlaySquare className="w-3.5 h-3.5" />}
          >
            Trigger Pipeline
          </Button>

          {/* Run Analyzer */}
          <Link to={`/app/analyze?repoId=${currentRepo?.id}`}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<SearchCode className="w-3.5 h-3.5 text-primary-600" />}
            >
              Analyze Repo
            </Button>
          </Link>

          {/* View Manifests */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenManifests}
            leftIcon={<ScrollText className="w-3.5 h-3.5 text-slate-600" />}
          >
            Manifests
          </Button>

          {/* Blueprints Spec */}
          <Link to="/app/blueprints">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileCode2 className="w-3.5 h-3.5 text-slate-600" />}
            >
              Blueprints
            </Button>
          </Link>

          {/* Terminal Console Toggle */}
          <Button
            variant={terminalOpen ? 'primary' : 'outline'}
            size="sm"
            onClick={onToggleTerminal}
            leftIcon={<Terminal className="w-3.5 h-3.5" />}
          >
            {terminalOpen ? 'Close Console' : 'Live Logs'}
          </Button>
        </div>
      </div>

      {/* Bottom Row: Repository Context Metadata */}
      <div className="pt-2 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <p className="truncate max-w-xl text-[11px] text-slate-600 font-medium">
          {currentRepo?.description}
        </p>

        <div className="flex items-center gap-3 shrink-0 text-[11px]">
          <span className="flex items-center gap-1.5 font-mono text-slate-600">
            <Server className="w-3 h-3 text-emerald-600" />
            <span>Target: aks-devops-eastus-01 (prod)</span>
          </span>
          <span className="h-3 w-[1px] bg-border" />
          <span className="text-slate-400 font-mono">
            Pipeline: 9 Stages • SonarQube & Trivy Gate
          </span>
        </div>
      </div>
    </div>
  );
};
