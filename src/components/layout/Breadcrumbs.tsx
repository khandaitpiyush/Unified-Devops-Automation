import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  app: 'Dashboard',
  repositories: 'Repositories',
  analyze: 'Analyzer',
  blueprints: 'DevOps Blueprints',
  artifacts: 'Generated Artifacts',
  pipelines: 'CI/CD Pipelines',
  security: 'Security & Quality',
  deployments: 'Deployments',
  infrastructure: 'Infrastructure',
  observability: 'Observability',
  integrations: 'Integrations',
  settings: 'Settings',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
      <Link to="/app" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {pathnames.slice(1).map((segment, index) => {
        const to = `/${pathnames.slice(0, index + 2).join('/')}`;
        const isLast = index === pathnames.slice(1).length - 1;
        const name = routeNames[segment] || segment;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-medium text-slate-900 truncate max-w-[200px]">{name}</span>
            ) : (
              <Link to={to} className="hover:text-slate-800 transition-colors truncate max-w-[150px]">
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
