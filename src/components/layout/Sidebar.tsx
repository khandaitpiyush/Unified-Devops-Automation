import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  SearchCode,
  FileCode2,
  ScrollText,
  PlaySquare,
  ShieldCheck,
  Layers,
  Server,
  Activity,
  Workflow,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const navSections = [
    {
      title: 'Control Plane',
      items: [
        { label: 'Overview', to: '/app', icon: LayoutDashboard },
        { label: 'Repositories', to: '/app/repositories', icon: GitBranch },
      ],
    },
    {
      title: 'DevOps Workflow',
      items: [
        { label: 'Analyzer', to: '/app/analyze', icon: SearchCode },
        { label: 'Blueprints', to: '/app/blueprints', icon: FileCode2 },
        { label: 'Generated Artifacts', to: '/app/artifacts', icon: ScrollText },
      ],
    },
    {
      title: 'Operations & Gates',
      items: [
        { label: 'CI/CD Pipelines', to: '/app/pipelines', icon: PlaySquare },
        { label: 'Security & Quality', to: '/app/security', icon: ShieldCheck },
        { label: 'Deployments', to: '/app/deployments', icon: Layers },
      ],
    },
    {
      title: 'Cloud & Telemetry',
      items: [
        { label: 'Infrastructure', to: '/app/infrastructure', icon: Server },
        { label: 'Observability', to: '/app/observability', icon: Activity },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { label: 'Integrations', to: '/app/integrations', icon: Workflow },
        { label: 'Settings', to: '/app/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 bg-white border-r border-border flex flex-col z-30 shrink-0 select-none transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'h-14 flex items-center border-b border-border transition-all duration-200',
          collapsed ? 'px-0 justify-center' : 'px-4 justify-between'
        )}
      >
        {!collapsed ? (
          <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-bold text-slate-900 tracking-tight leading-none truncate group-hover:text-primary-600 transition-colors">
                Unified DevOps
              </h1>
              <span className="text-[10px] text-slate-400 font-medium">Control Plane</span>
            </div>
          </NavLink>
        ) : (
          <NavLink
            to="/"
            className="flex items-center justify-center w-full"
            title="Unified DevOps Control Plane"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
          </NavLink>
        )}

        <button
          onClick={onToggleCollapse}
          className={cn(
            'p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors',
            collapsed && 'hidden'
          )}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Nav List */}
      <div
        className={cn(
          'flex-1 overflow-y-auto py-3.5 space-y-4 scrollbar-thin scrollbar-thumb-slate-200',
          collapsed ? 'px-2' : 'px-3'
        )}
      >
        {navSections.map((section, sectionIdx) => (
          <div key={section.title} className="space-y-1">
            {!collapsed ? (
              <p className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {section.title}
              </p>
            ) : (
              sectionIdx > 0 && <div className="h-[1px] bg-slate-100 my-2 mx-1" />
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/app'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-xs font-medium transition-all group relative',
                      collapsed
                        ? 'justify-center w-full h-9 px-0'
                        : 'px-3 py-2 gap-3',
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-primary-600'
                            : 'text-slate-400 group-hover:text-slate-700'
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {/* Active indicator bar on the left edge */}
                      {isActive && (
                        <span
                          className={cn(
                            'absolute bg-primary-600',
                            collapsed
                              ? 'left-0 top-1.5 bottom-1.5 w-1 rounded-r'
                              : 'left-0 top-2 bottom-2 w-0.5 rounded-r'
                          )}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Status & Collapse Toggle */}
      <div
        className={cn(
          'border-t border-border bg-surface-subtle/50 transition-all duration-200',
          collapsed ? 'p-2' : 'px-3.5 py-3'
        )}
      >
        {collapsed ? (
          <button
            onClick={onToggleCollapse}
            className="w-full h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium text-slate-600">Engine Online</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-border">
              v1.0.0
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

