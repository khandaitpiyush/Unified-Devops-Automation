import React from 'react';
import { Search, Bell, Github, Sparkles, ExternalLink, Server } from 'lucide-react';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';

export interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
  return (
    <header className="h-14 sticky top-0 z-20 bg-white border-b border-border px-5 flex items-center justify-between">
      {/* Search Input Button */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md border border-border bg-surface-subtle hover:bg-white hover:border-slate-300 text-xs text-slate-500 shadow-subtle transition-all"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search repositories, blueprints, pipelines...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 rounded border border-border">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Tools Area */}
      <div className="flex items-center gap-3">
        {/* Active Cluster Target */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface-subtle text-[11px] font-medium text-slate-600">
          <Server className="w-3 h-3 text-primary-600" />
          <span>aks-devops-eastus-01</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>

        {/* GitHub Connection Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-surface-subtle text-[11px] font-medium text-slate-700">
          <Github className="w-3.5 h-3.5 text-slate-800" />
          <span>GitHub Synced</span>
        </div>

        <Link to="/app/analyze">
          <Button variant="secondary" size="xs" leftIcon={<Sparkles className="w-3 h-3 text-primary-600" />}>
            Run Analyzer
          </Button>
        </Link>

        <div className="h-4 w-[1px] bg-border mx-0.5" />

        {/* User Info */}
        <div className="flex items-center gap-2">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
            alt="Piyush Khandait"
            className="w-6 h-6 rounded-full border border-border object-cover"
          />
          <div className="hidden xl:block text-left">
            <p className="text-[11px] font-semibold text-slate-900 leading-tight">Piyush Khandait</p>
            <p className="text-[9px] text-slate-400 leading-tight font-mono">devops@platform.internal</p>
          </div>
        </div>

        {/* Public landing link */}
        <Link
          to="/"
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
          title="Product Overview"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
};
