import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Database,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Radio,
  Server,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { observabilityService } from '@/services/observabilityService';
import { ObservabilityMetrics } from '@/types';

export const ObservabilityPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ObservabilityMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '6h' | '24h'>('1h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await observabilityService.getMetrics();
        setMetrics(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!metrics && !loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading observability telemetry...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Observability & Telemetry
            </h1>
            <span className="text-[11px] font-mono text-slate-400 bg-surface-subtle px-2 py-0.5 rounded border border-border">
              prometheus & grafana
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pod resource utilization, HTTP request throughput, 5xx error rate tracking, and operational Grafana dashboards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex items-center border border-border rounded-md bg-white p-0.5 shadow-subtle">
            {(['15m', '1h', '6h', '24h'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-1 text-[11px] font-mono font-medium rounded transition-colors ${
                  timeRange === r
                    ? 'bg-primary-600 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface-subtle text-[11px] font-medium text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Prometheus Live Scrape</span>
          </div>
        </div>
      </div>

      {/* KPI Resource Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                CPU Utilization
              </span>
              <Cpu className="w-4 h-4 text-primary-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">{metrics.cpuUsagePercent}%</span>
              <span className="text-[11px] text-slate-500">of 1.5 vCPU</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 mt-2.5 overflow-hidden">
              <div
                className="bg-primary-600 h-1 rounded-full"
                style={{ width: `${metrics.cpuUsagePercent}%` }}
              />
            </div>
          </Card>

          <Card className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Memory Utilization
              </span>
              <Database className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">{metrics.memoryUsagePercent}%</span>
              <span className="text-[11px] text-slate-500">of 3.0 GiB</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1 rounded-full"
                style={{ width: `${metrics.memoryUsagePercent}%` }}
              />
            </div>
          </Card>

          <Card className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Ingress Throughput
              </span>
              <Radio className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">{metrics.requestRateRps}</span>
              <span className="text-[11px] text-slate-500">req / sec</span>
            </div>
            <p className="text-[10px] text-emerald-700 mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Nominal ingress load
            </p>
          </Card>

          <Card className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Error Rate (5xx)
              </span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-600">{metrics.errorRatePercent}%</span>
              <span className="text-[11px] text-slate-500">error ratio</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-mono">
              Within 99.9% target SLA
            </p>
          </Card>
        </div>
      )}

      {/* SVG Timeseries Visualizer */}
      {metrics && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div>
              <CardTitle>Workload Resource Trends (Prometheus Metric Stream)</CardTitle>
              <p className="text-[11px] text-slate-400">Sampled pod metrics over window: {timeRange}</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600 text-[11px]">
                <span className="w-2.5 h-1 bg-blue-600 rounded-full" /> CPU Load (%)
              </span>
              <span className="flex items-center gap-1.5 text-indigo-600 text-[11px]">
                <span className="w-2.5 h-1 bg-indigo-600 rounded-full" /> Memory (%)
              </span>
            </div>
          </div>

          {/* Clean Restrained SVG Line Chart with Grid & Axis Markers */}
          <div className="h-52 w-full pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 150">
              {/* Gridlines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="65" x2="600" y2="65" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="110" x2="600" y2="110" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="145" x2="600" y2="145" stroke="#E2E8F0" strokeWidth="1" />

              {/* Memory Polyline */}
              <polyline
                fill="none"
                stroke="#6366F1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,60 100,58 200,48 300,52 400,55 500,54 600,52"
              />

              {/* CPU Polyline */}
              <polyline
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,110 100,100 200,75 300,85 400,105 500,92 600,88"
              />

              {/* Sample points */}
              <circle cx="200" cy="75" r="3.5" fill="#2563EB" />
              <circle cx="200" cy="48" r="3.5" fill="#6366F1" />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-400 border-t border-border pt-2">
            <span>T-60m</span>
            <span>T-45m</span>
            <span>T-30m (Spike)</span>
            <span>T-15m</span>
            <span>T-5m</span>
            <span>Now</span>
          </div>
        </Card>
      )}

      {/* Configured Grafana Deep Links */}
      {metrics && (
        <Card>
          <CardHeader className="py-2.5">
            <CardTitle>Configured Grafana Operational Dashboards</CardTitle>
            <span className="text-[11px] font-mono text-slate-400">grafana.internal linkouts</span>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {metrics.dashboards.map((dash, idx) => (
              <a
                key={idx}
                href={dash.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 hover:bg-surface-subtle transition-colors flex items-center justify-between text-xs group"
              >
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {dash.category}
                  </span>
                  <p className="font-bold text-slate-900 mt-1">{dash.title}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary-600">
                  <span className="font-mono text-[11px] hidden sm:inline">{dash.url}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
