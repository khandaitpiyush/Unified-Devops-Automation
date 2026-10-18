import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  Check,
  Pause,
  Play,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

export interface DevOpsTerminalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRepositoryName?: string;
  buildNumber?: number;
}

export const DevOpsTerminalDrawer: React.FC<DevOpsTerminalDrawerProps> = ({
  isOpen,
  onClose,
  activeRepositoryName = 'unified-devops-automation',
  buildNumber = 42,
}) => {
  const [activeTab, setActiveTab] = useState<'cicd' | 'k8s' | 'security' | 'engine'>('cicd');
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const sampleLogs: Record<'cicd' | 'k8s' | 'security' | 'engine', Array<{ time: string; level: 'INFO' | 'WARN' | 'ERROR'; text: string }>> = {
    cicd: [
      { time: '10:14:02', level: 'INFO', text: `Jenkins Pipeline agent provisioned: node-executor-x86_64` },
      { time: '10:14:04', level: 'INFO', text: `[Stage 1/9] Checkout: git clone https://github.com/khandaitpiyush/${activeRepositoryName}.git` },
      { time: '10:14:06', level: 'INFO', text: `Checked out commit d5656e6 (HEAD -> main)` },
      { time: '10:14:09', level: 'INFO', text: `[Stage 2/9] Dependencies: Running npm ci --prefer-offline` },
      { time: '10:14:13', level: 'INFO', text: `audited 1643 packages in 3.42s - 0 vulnerabilities found` },
      { time: '10:14:15', level: 'INFO', text: `[Stage 3/9] Test & Lint: Running npm run lint && npm test` },
      { time: '10:14:18', level: 'INFO', text: `TypeScript compiler verification: 0 syntax or type errors` },
      { time: '10:14:20', level: 'INFO', text: `[Stage 4/9] SonarQube Scanner: Project key: ${activeRepositoryName}` },
      { time: '10:14:24', level: 'INFO', text: `SonarQube Gate: PASSED (94.2% coverage, 0 bugs, 0 vulnerabilities)` },
      { time: '10:14:26', level: 'INFO', text: `[Stage 5/9] Trivy Vulnerability Scan: Scanning container layers...` },
      { time: '10:14:30', level: 'WARN', text: `Trivy: 2 medium severity vulnerabilities detected in base OS packages (CVE-2024-2961)` },
      { time: '10:14:31', level: 'INFO', text: `Trivy Zero-Critical Policy: Enforced. 0 Critical, 0 High detected. Gate: PASSED` },
      { time: '10:14:33', level: 'INFO', text: `[Stage 6/9] Docker Multi-Stage Build: Tagging ghcr.io/khandaitpiyush/${activeRepositoryName}:v1.0.0` },
      { time: '10:14:39', level: 'INFO', text: `Container image generated successfully. Compressed size: 84.2 MB` },
      { time: '10:14:41', level: 'INFO', text: `[Stage 7/9] Registry Push: Uploading image layers to GitHub Container Registry (ghcr.io)...` },
      { time: '10:14:46', level: 'INFO', text: `Pushed ghcr.io/khandaitpiyush/${activeRepositoryName}:v1.0.0 with digest sha256:7f9b8c...` },
      { time: '10:14:48', level: 'INFO', text: `[Stage 8/9] Kubernetes Rollout: kubectl apply -f k8s/ -n production` },
      { time: '10:14:52', level: 'INFO', text: `deployment.apps/${activeRepositoryName} successfully rolled out to 3/3 replicas` },
      { time: '10:14:54', level: 'INFO', text: `[Stage 9/9] Telemetry & Metadata: Recording build #${buildNumber} to Prometheus & Grafana` },
      { time: '10:14:55', level: 'INFO', text: `Pipeline finished successfully in 53s. Status: SUCCESS` },
    ],
    k8s: [
      { time: '10:14:50', level: 'INFO', text: `[kubelet] Pulling image "ghcr.io/khandaitpiyush/${activeRepositoryName}:v1.0.0"` },
      { time: '10:14:51', level: 'INFO', text: `[kubelet] Successfully pulled image in 1.12s (84.2 MB)` },
      { time: '10:14:51', level: 'INFO', text: `[container-runtime] Created container ${activeRepositoryName}-app` },
      { time: '10:14:52', level: 'INFO', text: `[container-runtime] Started container ${activeRepositoryName}-app` },
      { time: '10:14:53', level: 'INFO', text: `HTTP server listening on port 3000 (0.0.0.0:3000)` },
      { time: '10:14:53', level: 'INFO', text: `Liveness & Readiness probe passed: GET /healthz 200 OK (2ms)` },
      { time: '10:15:10', level: 'INFO', text: `[Ingress-nginx] 200 GET /app/ 12ms 1.4kb user-agent: Mozilla/5.0` },
      { time: '10:15:45', level: 'INFO', text: `[Ingress-nginx] 200 GET /api/v1/telemetry 4ms 890b` },
    ],
    security: [
      { time: '10:14:26', level: 'INFO', text: `trivy image --severity CRITICAL,HIGH,MEDIUM --exit-code 1 ghcr.io/...` },
      { time: '10:14:27', level: 'INFO', text: `Loaded 142 OS packages from Alpine Linux 3.19` },
      { time: '10:14:28', level: 'INFO', text: `Scanning Node.js package.json and package-lock.json dependencies...` },
      { time: '10:14:29', level: 'INFO', text: `Total dependencies analyzed: 844 direct and transitive dependencies` },
      { time: '10:14:30', level: 'WARN', text: `CVE-2024-2961: glibc buffer overflow (MEDIUM) - Fixed in upstream 2.39-r2` },
      { time: '10:14:31', level: 'INFO', text: `Security Gate Evaluation: CRITICAL=0, HIGH=0, MEDIUM=1. Policy threshold CRITICAL. Passed!` },
    ],
    engine: [
      { time: '10:14:00', level: 'INFO', text: `DevOps Controller: Webhook received from github.com/khandaitpiyush/${activeRepositoryName}` },
      { time: '10:14:01', level: 'INFO', text: `Matched rule: Push to main -> Automated Production Delivery` },
      { time: '10:14:02', level: 'INFO', text: `Approved blueprint v1.2.0 loaded with 5 generated artifacts` },
      { time: '10:14:55', level: 'INFO', text: `Workflow executed with 0 human intervention required` },
    ],
  };

  const logs = sampleLogs[activeTab].filter((l) => {
    if (filterLevel === 'ALL') return true;
    return l.level === filterLevel;
  });

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const raw = logs.map((l) => `[${l.time}] [${l.level}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    toast.success('Logs Copied', 'Terminal output copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 bg-slate-950 border-t border-slate-800 shadow-2xl flex flex-col font-mono text-xs transition-all duration-200',
        expanded ? 'h-[75vh]' : 'h-80'
      )}
    >
      {/* Console Header Bar */}
      <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
            <Terminal className="w-4 h-4 text-primary-400" />
            <span>DevOps Stream Console</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* Stream Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('cicd')}
              className={cn(
                'px-2.5 py-1 rounded text-[11px] font-medium transition-colors',
                activeTab === 'cicd'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              Jenkins CI/CD (#{buildNumber})
            </button>
            <button
              onClick={() => setActiveTab('k8s')}
              className={cn(
                'px-2.5 py-1 rounded text-[11px] font-medium transition-colors',
                activeTab === 'k8s'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              Kubernetes Pod Logs
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={cn(
                'px-2.5 py-1 rounded text-[11px] font-medium transition-colors',
                activeTab === 'security'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              Trivy & Security Audit
            </button>
            <button
              onClick={() => setActiveTab('engine')}
              className={cn(
                'px-2.5 py-1 rounded text-[11px] font-medium transition-colors',
                activeTab === 'engine'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              DevOps Engine Events
            </button>
          </div>
        </div>

        {/* Tools & Controls */}
        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-slate-500">Filter:</span>
            {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px]',
                  filterLevel === lvl
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                )}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              'p-1 text-slate-400 hover:text-slate-200 rounded',
              autoScroll && 'text-primary-400'
            )}
            title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll paused'}
          >
            {autoScroll ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1 text-slate-400 hover:text-slate-200 rounded"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Expand / Minimize */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded"
            title={expanded ? 'Minimize terminal' : 'Maximize terminal'}
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded"
            title="Close terminal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 bg-slate-950 font-mono text-xs selection:bg-primary-800 selection:text-white"
      >
        {logs.length === 0 ? (
          <div className="text-slate-500 py-6 text-center">No logs match the selected filter.</div>
        ) : (
          logs.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 font-mono text-[11px]">
              <span className="text-slate-500 select-none">{item.time}</span>
              <span
                className={cn(
                  'px-1 rounded text-[9px] font-bold select-none',
                  item.level === 'INFO' && 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40',
                  item.level === 'WARN' && 'text-amber-400 bg-amber-950/60 border border-amber-800/40',
                  item.level === 'ERROR' && 'text-rose-400 bg-rose-950/60 border border-rose-800/40'
                )}
              >
                {item.level}
              </span>
              <span className="text-slate-200 break-all">{item.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
