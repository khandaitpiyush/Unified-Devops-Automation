import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  GitBranch,
  ExternalLink,
  SearchCode,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { StatusPill } from '@/components/common/StatusPill';
import { repositoryService } from '@/services/repositoryService';
import { Repository } from '@/types';
import { ConnectRepoModal } from './ConnectRepoModal';
import { formatDate } from '@/lib/utils';

export const RepositoriesPage: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLang, setFilterLang] = useState('ALL');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepos() {
      try {
        setLoading(true);
        const res = await repositoryService.getRepositories();
        setRepositories(res.data);
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, []);

  const filteredRepos = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang =
      filterLang === 'ALL' || repo.language.toLowerCase().includes(filterLang.toLowerCase());
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-5">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Repository Management
            </h1>
            <span className="text-[11px] font-mono text-slate-400 bg-surface-subtle px-2 py-0.5 rounded border border-border">
              {repositories.length} total repos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Connected GitHub repositories with automated evidence extraction and explainable DevOps blueprint generation.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsConnectModalOpen(true)}
        >
          Connect Repository
        </Button>
      </div>

      {/* Control Bar: Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search repositories by name, stack, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-white placeholder:text-slate-400 focus-ring shadow-subtle"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md border border-border bg-white text-slate-700 focus-ring"
          >
            <option value="ALL">All Application Stacks</option>
            <option value="TypeScript">TypeScript / React</option>
            <option value="Java">Java / Spring Boot</option>
            <option value="JavaScript">JavaScript / Node.js</option>
          </select>
        </div>
      </div>

      {/* Enterprise Repositories Data Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Repository</th>
                <th>Stack / Runtime</th>
                <th>Default Branch</th>
                <th>DevOps Blueprint</th>
                <th>Latest Pipeline</th>
                <th>Deployment Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepos.map((repo) => (
                <tr key={repo.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                      <Link
                        to={`/app/repositories/${repo.id}`}
                        className="font-bold text-slate-900 hover:text-primary-600 transition-colors text-xs"
                      >
                        {repo.fullName}
                      </Link>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {repo.visibility}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                      {repo.description}
                    </p>
                  </td>
                  <td>
                    <span className="text-xs font-medium text-slate-700 bg-surface-subtle px-2 py-0.5 rounded border border-border inline-block">
                      {repo.language}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {repo.defaultBranch}
                    </span>
                  </td>
                  <td>
                    <StatusPill status={repo.blueprintStatus || 'none'} />
                  </td>
                  <td>
                    <StatusPill status={repo.latestPipelineStatus || 'none'} />
                  </td>
                  <td>
                    <StatusPill status={repo.latestDeploymentStatus || 'none'} />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/app/analyze?repoId=${repo.id}`}>
                        <Button variant="secondary" size="xs" leftIcon={<SearchCode className="w-3 h-3 text-primary-600" />}>
                          Analyze
                        </Button>
                      </Link>
                      <Link to={`/app/repositories/${repo.id}`}>
                        <Button variant="outline" size="xs">
                          Workspace
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRepos.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-500">
                    No repositories match the current search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConnectRepoModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnected={(newRepo) => setRepositories([newRepo, ...repositories])}
      />
    </div>
  );
};
