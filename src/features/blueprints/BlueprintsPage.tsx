import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCode2,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Filter,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { StatusPill } from '@/components/common/StatusPill';
import { blueprintService } from '@/services/blueprintService';
import { DevOpsBlueprint } from '@/types';
import { formatDate } from '@/lib/utils';

export const BlueprintsPage: React.FC = () => {
  const [blueprints, setBlueprints] = useState<DevOpsBlueprint[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlueprints() {
      try {
        setLoading(true);
        const res = await blueprintService.getBlueprints();
        setBlueprints(res.data);
      } finally {
        setLoading(false);
      }
    }
    loadBlueprints();
  }, []);

  const filtered = blueprints.filter((bp) => {
    const matchesSearch =
      bp.repositoryName.toLowerCase().includes(search.toLowerCase()) ||
      bp.version.toLowerCase().includes(search.toLowerCase()) ||
      bp.stack.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || bp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              DevOps Blueprint Management
            </h1>
            <span className="text-[11px] font-mono text-slate-400 bg-surface-subtle px-2 py-0.5 rounded border border-border">
              immutable versions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Declarative architecture blueprints linking repository fingerprints directly to validated CI/CD pipelines and Kubernetes workloads.
          </p>
        </div>

        <Link to="/app/analyze">
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            New Blueprint
          </Button>
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search blueprints by repository, version, or runtime..."
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
            <option value="approved">Approved & Locked</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="draft">Draft Versions</option>
          </select>
        </div>
      </div>

      {/* Blueprint Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Blueprint & Repository</th>
                <th>Version</th>
                <th>Target Environment</th>
                <th>Container & Replicas</th>
                <th>Governance Status</th>
                <th>Created / Approved</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bp) => (
                <tr key={bp.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                      <Link
                        to={`/app/blueprints/${bp.id}`}
                        className="font-bold text-slate-900 hover:text-primary-600 text-xs"
                      >
                        {bp.repositoryName}
                      </Link>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{bp.stack}</p>
                  </td>
                  <td>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {bp.version}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-700">{bp.deploymentTarget}</span>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] text-slate-600">
                      {bp.config.deployment.replicas} pods • {bp.config.container.baseImage}
                    </span>
                  </td>
                  <td>
                    <StatusPill status={bp.status} />
                  </td>
                  <td>
                    <p className="text-xs text-slate-700">{formatDate(bp.createdAt)}</p>
                    {bp.approvedBy && (
                      <p className="text-[10px] text-emerald-700 font-medium truncate max-w-[130px]">
                        by {bp.approvedBy.split('@')[0]}
                      </p>
                    )}
                  </td>
                  <td className="text-right">
                    <Link to={`/app/blueprints/${bp.id}`}>
                      <Button variant="secondary" size="xs" rightIcon={<ArrowRight className="w-3 h-3" />}>
                        Inspect Spec
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-500">
                    No blueprints matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
