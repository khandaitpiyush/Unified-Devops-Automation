import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  ArrowRight,
  GitBranch,
  SearchCode,
  FileCode2,
  ShieldCheck,
  PlaySquare,
  Layers,
  Server,
  Activity,
  CheckCircle2,
  Lock,
  Workflow,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { animateFadeIn } from '@/lib/animations';

export const LandingPage: React.FC = () => {
  const [selectedStageIdx, setSelectedStageIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animateFadeIn(heroRef.current, { duration: 0.45, y: 12 });
  }, []);

  const pipelineStages = [
    {
      num: '01',
      name: 'SCM Checkout',
      command: 'git checkout ${GIT_COMMIT}',
      desc: 'Validates commit integrity and branch policy against GitHub webhook payloads.',
    },
    {
      num: '02',
      name: 'Dependency Audit',
      command: 'npm ci --prefer-offline --audit',
      desc: 'Deterministic package-lock v3 verification preventing rogue transitive dependencies.',
    },
    {
      num: '03',
      name: 'Compiler & Tests',
      command: 'npm run lint && npm test',
      desc: 'Executes strict TypeScript type checking and unit test suites before compilation.',
    },
    {
      num: '04',
      name: 'SonarQube Gate',
      command: 'sonar-scanner -Dsonar.qualitygate.wait=true',
      desc: 'Enforces minimum 80% code coverage threshold, zero bugs, and low code smell limits.',
    },
    {
      num: '05',
      name: 'Trivy CVE Scan',
      command: 'trivy fs --severity HIGH,CRITICAL --exit-code 1 .',
      desc: 'Halts the pipeline immediately if any unresolved Critical or High CVE is detected.',
    },
    {
      num: '06',
      name: 'Hardened Docker Build',
      command: 'docker build -t ghcr.io/org/app:${TAG} .',
      desc: 'Synthesizes multi-stage Alpine Linux container using non-root user execution privileges.',
    },
    {
      num: '07',
      name: 'Publish to GHCR',
      command: 'docker push ghcr.io/org/app:${TAG}',
      desc: 'Publishes signed OCI container images with commit SHA digest tracking.',
    },
    {
      num: '08',
      name: 'Kubernetes Rollout',
      command: 'kubectl rollout status deployment/web --timeout=180s',
      desc: 'Executes zero-downtime rolling updates with active liveness and readiness health probes.',
    },
    {
      num: '09',
      name: 'Telemetry Record',
      command: 'mongo-client --eval "recordDeployment(meta)"',
      desc: 'Records immutable deployment record and DORA lead time metrics in MongoDB Atlas.',
    },
  ];

  const integrations = [
    'GitHub',
    'Jenkins',
    'Docker Engine',
    'GHCR',
    'SonarQube',
    'Trivy',
    'Kubernetes',
    'Terraform',
    'Azure AKS',
    'Prometheus',
    'Grafana',
    'MongoDB Atlas',
  ];

  const selectedStage = pipelineStages[selectedStageIdx];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center text-white shadow-sm">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                Unified DevOps Automation
              </span>
              <span className="hidden sm:inline-block text-[10px] text-slate-400 ml-2 font-mono">
                Control Plane
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/app" className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1">
              Sign In
            </Link>
            <Link to="/app">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                Launch Control Plane
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center" ref={heroRef}>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-subtle text-slate-700 border border-border text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
          <span>Repository-Driven Developer Control Plane</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
          Explainable DevOps Blueprints.{' '}
          <span className="text-primary-600">Security-Gated Deployments.</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Transform any GitHub repository into verified Jenkins CI/CD, hardened multi-stage Dockerfiles, and Kubernetes manifests through deterministic fingerprinting and human-approved governance.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link to="/app">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Developer Console
            </Button>
          </Link>
          <Link to="/app/analyze">
            <Button variant="secondary" size="md" leftIcon={<SearchCode className="w-3.5 h-3.5 text-primary-600" />}>
              Analyze Sample Repository
            </Button>
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero Blind Code Generation
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Trivy Zero-Critical Policy Gate
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" /> Immutable Version Governance
          </span>
        </div>
      </section>

      {/* The 5-Step Core Differentiator Lifecycle */}
      <section className="py-14 bg-surface-subtle border-y border-border px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-1 max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              The Transparent DevOps Lifecycle
            </h2>
            <p className="text-xs text-slate-500">
              Eliminate black-box automation. Every generated manifest is backed by repository evidence and human approval.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 space-y-2 bg-white">
              <span className="font-mono text-xs font-bold text-primary-600">01</span>
              <h3 className="text-xs font-bold text-slate-900">Evidence Extraction</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Scans package manifests, lockfiles, test scripts, and existing configs to derive deterministic framework fingerprints.
              </p>
            </Card>

            <Card className="p-4 space-y-2 bg-white">
              <span className="font-mono text-xs font-bold text-indigo-600">02</span>
              <h3 className="text-xs font-bold text-slate-900">DevOps Blueprint</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Synthesizes declarative, explainable specifications for containerization, registries, quality gates, and cluster topologies.
              </p>
            </Card>

            <Card className="p-4 space-y-2 bg-white">
              <span className="font-mono text-xs font-bold text-emerald-600">03</span>
              <h3 className="text-xs font-bold text-slate-900">Human Approval</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Engineers review and authorize the blueprint. Approved blueprints are locked as immutable release records.
              </p>
            </Card>

            <Card className="p-4 space-y-2 bg-white">
              <span className="font-mono text-xs font-bold text-purple-600">04</span>
              <h3 className="text-xs font-bold text-slate-900">Security-Gated CI/CD</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Dispatches a 9-stage Jenkins pipeline, halting deployments on Trivy CVE or SonarQube quality gate failures.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive 9-Stage Pipeline Walkthrough */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <span className="text-[11px] font-semibold text-primary-600 uppercase tracking-wider">
            Automated Delivery Engine
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Comprehensive 9-Stage Delivery Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Click any stage below to inspect the automated terminal commands and governance checks.
          </p>
        </div>

        {/* 9-Stage Stepper Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
          {pipelineStages.map((stage, idx) => {
            const isSelected = selectedStageIdx === idx;
            return (
              <button
                key={stage.num}
                onClick={() => setSelectedStageIdx(idx)}
                className={`p-2.5 rounded-md border text-left transition-colors ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50/70 shadow-sm'
                    : 'border-border bg-white hover:bg-slate-50'
                }`}
              >
                <span className="font-mono text-[10px] font-bold text-primary-600 block">
                  {stage.num}
                </span>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{stage.name}</p>
              </button>
            );
          })}
        </div>

        {/* Interactive Terminal Inspection Window */}
        <Card className="overflow-hidden border-slate-800">
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-200 font-semibold">Stage {selectedStage.num}: {selectedStage.name}</span>
            </div>
            <span>Jenkins Agent Exec</span>
          </div>

          <div className="bg-[#0B0F19] p-4 font-mono text-xs text-slate-200 space-y-2 select-text">
            <div className="flex items-center gap-2 text-primary-400 font-bold">
              <span>$</span>
              <span>{selectedStage.command}</span>
            </div>
            <p className="text-slate-400 text-[11px] pt-1">
              Purpose: {selectedStage.desc}
            </p>
          </div>
        </Card>
      </section>

      {/* Enterprise Ecosystem Grid */}
      <section className="py-14 bg-surface-subtle border-t border-border px-6">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Integrated DevOps Ecosystem
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Backend-mediated orchestration without exposing third-party tokens to the browser
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {integrations.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-md bg-white border border-border text-xs font-medium text-slate-800 shadow-subtle"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="py-8 px-6 border-t border-border bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-primary-600" />
            <span className="font-bold text-slate-900">Unified DevOps Automation</span>
            <span>— Developer Control Plane</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>React 18</span>
            <span>•</span>
            <span>TypeScript Strict</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>GSAP</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
