import React, { useState, useEffect } from 'react';
import {
  Workflow,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Lock,
  GitBranch,
  PlaySquare,
  Package,
  ShieldCheck,
  Layers,
  Server,
  Cloud,
  Activity,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { StatusPill } from '@/components/common/StatusPill';
import { integrationService } from '@/services/integrationService';
import { IntegrationItem } from '@/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

export const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await integrationService.getIntegrations();
        setIntegrations(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleTestConnection = async (id: string) => {
    try {
      setTestingId(id);
      const res = await integrationService.testConnection(id);
      toast.success('Connection Verified', res.data.message);
      setIntegrations((prev) =>
        prev.map((i) => (i.id === id ? { ...i, lastVerifiedAt: new Date().toISOString() } : i))
      );
    } catch {
      toast.error('Connection failed', 'Unable to reach third-party endpoint.');
    } finally {
      setTestingId(null);
    }
  };

  const filtered = integrations.filter((item) => {
    if (filterCategory === 'ALL') return true;
    return item.category === filterCategory;
  });

  const getCategoryIcon = (category: IntegrationItem['category']) => {
    switch (category) {
      case 'vcs':
        return <GitBranch className="w-3.5 h-3.5 text-slate-800" />;
      case 'ci':
        return <PlaySquare className="w-3.5 h-3.5 text-indigo-600" />;
      case 'container':
      case 'registry':
        return <Package className="w-3.5 h-3.5 text-blue-600" />;
      case 'security':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'orchestration':
        return <Layers className="w-3.5 h-3.5 text-primary-600" />;
      case 'iac':
        return <Server className="w-3.5 h-3.5 text-purple-600" />;
      case 'monitoring':
        return <Activity className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Third-Party Integrations
            </h1>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-medium">
              <Lock className="w-3 h-3" /> backend-mediated secrets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configured external service connections for GitHub, Jenkins, Docker, GHCR, SonarQube, Trivy, Kubernetes, Terraform, Azure, Prometheus, and Grafana.
          </p>
        </div>

        {/* Filter by Category */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md border border-border bg-white text-slate-700 focus-ring"
          >
            <option value="ALL">All Categories ({integrations.length})</option>
            <option value="vcs">Version Control (VCS)</option>
            <option value="ci">CI/CD Engine</option>
            <option value="container">Containers & Registry</option>
            <option value="security">Security & Quality</option>
            <option value="orchestration">Kubernetes Orchestration</option>
            <option value="iac">Terraform & Cloud</option>
            <option value="monitoring">Monitoring & Telemetry</option>
          </select>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between">
            <div>
              <CardHeader className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-surface-subtle border border-border">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <CardTitle className="text-xs">{item.name}</CardTitle>
                    <span className="text-[9px] text-slate-400 font-mono uppercase">
                      {item.category}
                    </span>
                  </div>
                </div>
                <StatusPill status={item.status} />
              </CardHeader>

              <CardContent className="space-y-2.5 pt-3">
                <p className="text-xs text-slate-600 leading-relaxed min-h-[32px]">
                  {item.description}
                </p>

                {/* Parameters Preview */}
                <div className="space-y-1 pt-1">
                  {item.configFields.map((field) => (
                    <div
                      key={field.key}
                      className="text-[11px] flex items-center justify-between p-1.5 rounded bg-surface-subtle border border-border/60"
                    >
                      <span className="text-slate-500">{field.label}</span>
                      <span className="font-mono text-slate-800 font-medium truncate max-w-[130px]">
                        {field.isSecret ? '••••••••••••' : field.value || field.placeholder}
                      </span>
                    </div>
                  ))}
                </div>

                {item.lastVerifiedAt && (
                  <p className="text-[10px] text-slate-400 font-mono pt-1">
                    Verified: {formatDate(item.lastVerifiedAt)}
                  </p>
                )}
              </CardContent>
            </div>

            {/* Footer with Test and Docs */}
            <div className="p-3 bg-surface-subtle border-t border-border/80 flex items-center justify-between rounded-b-lg">
              <a
                href={item.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                Docs <ExternalLink className="w-3 h-3" />
              </a>

              <Button
                variant="secondary"
                size="xs"
                onClick={() => handleTestConnection(item.id)}
                isLoading={testingId === item.id}
                leftIcon={<RefreshCw className={`w-3 h-3 ${testingId === item.id ? 'animate-spin' : ''}`} />}
              >
                Test Connection
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
