import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlaySquare,
  GitBranch,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { StatusPill } from '@/components/common/StatusPill';
import { pipelineService } from '@/services/pipelineService';
import { repositoryService } from '@/services/repositoryService';
import { PipelineExecution, Repository } from '@/types';
import { TriggerPipelineModal } from './TriggerPipelineModal';
import { formatDate, formatDuration } from '@/lib/utils';

export const PipelinesPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<PipelineExecution[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      const [pRes, rRes] = await Promise.all([
        pipelineService.getPipelines(),
        repositoryService.getRepositories(),
      ]);
      setPipelines(pRes.data);
      setRepos(rRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const filtered = pipelines.filter((pipe) => {
    const matchesSearch =
      pipe.repositoryName.toLowerCase().includes(search.toLowerCase()) ||
      pipe.commitMessage.toLowerCase().includes(search.toLowerCase()) ||
      pipe.commitSha.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || pipe.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              CI/CD Pipeline Executions
            </h1>
            <span className="text-[11px] font-mono text-slate-400 bg-surface-subtle px-2 py-0.5 rounded border border-border">
              jenkins declarative fleet
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated 9-stage delivery pipeline executions including quality gates, container builds, and Kubernetes deployments.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsTriggerModalOpen(true)}
        >
          Dispatch Pipeline
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search executions by commit SHA, message, or repository..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-white placeholder:text-slate-400 focus-ring shadow-subtle"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md border border-border bg-white text-slate-700 focus-ring"
          >
            <option value="ALL">All Statuses</option>
            <option value="success">Success</option>
            <option value="running">In Progress</option>
            <option value="failed">Failed / Blocked</option>
          </select>
        </div>
      </div>

      {/* Executions Data Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Execution & Target</th>
                <th>Commit Message</th>
                <th>Branch & SHA</th>
                <th>9-Stage Progression</th>
                <th>Duration & Start</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pipe) => (
                <tr key={pipe.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        #{pipe.buildNumber}
                      </span>
                      <Link
                        to={`/app/pipelines/${pipe.id}`}
                        className="font-semibold text-slate-800 hover:text-primary-600 text-xs"
                      >
                        {pipe.repositoryName}
                      </Link>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5 block">
                      Trigger: {pipe.triggerSource}
                    </span>
                  </td>
                  <td>
                    <p className="text-xs text-slate-700 truncate max-w-xs">{pipe.commitMessage}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {pipe.branch}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{pipe.commitSha}</span>
                    </div>
                  </td>
                  <td>
                    {/* Compact 9-stage progression dots */}
                    <div className="flex items-center gap-1.5">
                      {pipe.stages.map((stg) => (
                        <span
                          key={stg.id}
                          className={`w-2 h-2 rounded-full ${
                            stg.status === 'success'
                              ? 'bg-emerald-500'
                              : stg.status === 'failed'
                              ? 'bg-rose-500 ring-2 ring-rose-200'
                              : stg.status === 'running'
                              ? 'bg-blue-500 animate-pulse'
                              : 'bg-slate-200'
                          }`}
                          title={`${stg.order}. ${stg.name} (${stg.status})`}
                        />
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      {formatDuration(pipe.durationSeconds)}
                    </span>
                    <p className="text-[10px] text-slate-400">{formatDate(pipe.startTime)}</p>
                  </td>
                  <td>
                    <StatusPill status={pipe.status} />
                  </td>
                  <td className="text-right">
                    <Link to={`/app/pipelines/${pipe.id}`}>
                      <Button variant="secondary" size="xs">
                        Inspect Logs
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-500">
                    No pipeline runs matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <TriggerPipelineModal
        isOpen={isTriggerModalOpen}
        onClose={() => setIsTriggerModalOpen(false)}
        repositories={repos}
        onTriggered={fetchPipelines}
      />
    </div>
  );
};
