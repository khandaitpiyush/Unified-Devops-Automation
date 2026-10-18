import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  GitBranch,
  SearchCode,
  FileCode2,
  ScrollText,
  PlaySquare,
  ShieldCheck,
  Server,
  Activity,
  Layers,
  Settings,
} from 'lucide-react';
import { animateModalEntrance } from '@/lib/animations';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const actions = [
    { label: 'Overview Dashboard', icon: LayoutDashboard, path: '/app', category: 'Navigation' },
    { label: 'Repository Management', icon: GitBranch, path: '/app/repositories', category: 'Navigation' },
    { label: 'Repository Analyzer', icon: SearchCode, path: '/app/analyze', category: 'DevOps Workflow' },
    { label: 'DevOps Blueprints', icon: FileCode2, path: '/app/blueprints', category: 'DevOps Workflow' },
    { label: 'Generated Artifacts (Jenkinsfile, K8s)', icon: ScrollText, path: '/app/artifacts', category: 'DevOps Workflow' },
    { label: 'CI/CD Pipelines (9-Stage Execution)', icon: PlaySquare, path: '/app/pipelines', category: 'DevOps Operations' },
    { label: 'Security & Quality Center (SonarQube & Trivy)', icon: ShieldCheck, path: '/app/security', category: 'DevOps Operations' },
    { label: 'Kubernetes Deployments', icon: Layers, path: '/app/deployments', category: 'DevOps Operations' },
    { label: 'Terraform Infrastructure', icon: Server, path: '/app/infrastructure', category: 'Infrastructure' },
    { label: 'Prometheus & Grafana Observability', icon: Activity, path: '/app/observability', category: 'Observability' },
    { label: 'Third-Party Integrations', icon: Layers, path: '/app/integrations', category: 'Settings' },
    { label: 'Platform Settings', icon: Settings, path: '/app/settings', category: 'Settings' },
  ];

  useEffect(() => {
    if (isOpen) {
      animateModalEntrance(paletteRef.current);
      inputRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      setQuery('');
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = actions.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[4px]" onClick={onClose} />
      <div
        ref={paletteRef}
        className="relative w-full max-w-xl bg-white rounded-2xl border border-border shadow-glass overflow-hidden z-10"
      >
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or jump to workspace screen..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded font-mono border border-slate-200">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No matching navigation commands</p>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-subtle text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-surface-subtle border border-border text-slate-600 group-hover:text-primary-600 group-hover:bg-primary-50 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-500 font-sans">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
