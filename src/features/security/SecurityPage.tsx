import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Filter,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { securityService } from '@/services/securityService';
import { repositoryService } from '@/services/repositoryService';
import { SecurityOverview, Repository } from '@/types';
import { formatDate } from '@/lib/utils';

export const SecurityPage: React.FC = () => {
  const [securityData, setSecurityData] = useState<Record<string, SecurityOverview>>({});
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>('repo-unified-devops');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [secRes, repoRes] = await Promise.all([
          securityService.getAllSecurity(),
          repositoryService.getRepositories(),
        ]);
        setSecurityData(secRes.data);
        setRepos(repoRes.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const currentSecurity = securityData[selectedRepoId] || securityData['repo-unified-devops'];

  const filteredVulns =
    currentSecurity?.vulnerabilities.filter((v) => {
      if (filterSeverity === 'ALL') return true;
      return v.severity === filterSeverity;
    }) || [];

  return (
    <div className="space-y-5">
      {/* Scope Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Security & Quality Center
            </h1>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-medium">
              <Lock className="w-3 h-3" /> zero-critical policy active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous CVE image scanning via Trivy and static code analysis coverage gates via SonarQube.
          </p>
        </div>

        {/* Repository Switcher */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md border border-border bg-white text-slate-800 focus-ring shadow-subtle min-w-[200px]"
          >
            {repos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Honest Scanner Unconfigured Notice */}
      {currentSecurity?.scanStatus === 'unconfigured' && (
        <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Security Scanner Unconfigured for this Repository</p>
            <p className="text-amber-800">
              No Trivy scanner or SonarQube quality gate is connected to this project. In accordance with zero-trust principles, unconfigured scans are never represented as passing.
            </p>
            <div className="pt-1">
              <a href="/app/integrations">
                <Button variant="secondary" size="xs">
                  Configure Trivy Integration
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Deployment Gate Alert */}
      {currentSecurity?.blockedDeploymentReason && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Deployment Admission Blocked</p>
            <p className="text-rose-800">{currentSecurity.blockedDeploymentReason}</p>
          </div>
        </div>
      )}

      {currentSecurity && currentSecurity.scanStatus !== 'unconfigured' && (
        <>
          {/* 4 Severity Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-3.5 border-l-2 border-l-rose-500">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Critical CVEs
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-rose-600">
                  {currentSecurity.severityCounts.critical}
                </span>
                <span className="text-[11px] text-slate-500">findings</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Zero-critical policy strictly enforced</p>
            </Card>

            <Card className="p-3.5 border-l-2 border-l-amber-500">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                High Severity
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-amber-600">
                  {currentSecurity.severityCounts.high}
                </span>
                <span className="text-[11px] text-slate-500">findings</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Requires remediation within 14 days</p>
            </Card>

            <Card className="p-3.5 border-l-2 border-l-blue-500">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Medium & Low
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-800">
                  {currentSecurity.severityCounts.medium + currentSecurity.severityCounts.low}
                </span>
                <span className="text-[11px] text-slate-500">findings</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {currentSecurity.severityCounts.medium} Med • {currentSecurity.severityCounts.low} Low
              </p>
            </Card>

            <Card className="p-3.5 border-l-2 border-l-emerald-500">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                SonarQube Coverage
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-emerald-600">
                  {currentSecurity.sonarqube.coverage}%
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Gate: {currentSecurity.sonarqube.status}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Bugs: {currentSecurity.sonarqube.bugs} • Code Smells: {currentSecurity.sonarqube.codeSmells}
              </p>
            </Card>
          </div>

          {/* Trivy Vulnerabilities Data Table */}
          <Card>
            <CardHeader className="py-2.5">
              <div>
                <CardTitle>Trivy CVE Vulnerability Inventory</CardTitle>
                <p className="text-[11px] text-slate-400">
                  Scanned repository: <strong className="text-slate-700 font-mono">{currentSecurity.repositoryName}</strong> • {formatDate(currentSecurity.lastScanDate)}
                </p>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-2 py-1 text-xs rounded-md border border-border bg-white text-slate-700 focus-ring"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left data-table">
                <thead>
                  <tr>
                    <th>CVE Identifier</th>
                    <th>Severity</th>
                    <th>Package / Component</th>
                    <th>Installed → Fixed</th>
                    <th>Vulnerability Title & Target</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVulns.map((v) => (
                    <tr key={v.id}>
                      <td className="font-mono font-bold text-slate-900 text-xs">
                        {v.id}
                      </td>
                      <td>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            v.severity === 'CRITICAL'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : v.severity === 'HIGH'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : v.severity === 'MEDIUM'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {v.severity}
                        </span>
                      </td>
                      <td className="font-mono text-slate-800 text-xs font-medium">
                        {v.pkgName}
                      </td>
                      <td className="font-mono text-xs text-slate-600">
                        {v.installedVersion} → <span className="text-emerald-700 font-semibold">{v.fixedVersion || 'N/A'}</span>
                      </td>
                      <td>
                        <p className="font-medium text-slate-900 text-xs">{v.title}</p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                          Target manifest: {v.target}
                        </p>
                      </td>
                    </tr>
                  ))}

                  {filteredVulns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-500">
                        No vulnerabilities found matching this filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
