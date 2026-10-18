# Unified DevOps Automation — Developer Control Plane

An end-to-end repository-driven DevOps control plane that automates continuous integration, static analysis, container vulnerability scanning, image registry publishing, and Kubernetes deployments through explainable blueprints and human-approved governance.

---

## 1. Product Vision & Differentiator

Unlike generic CI/CD wrappers or opaque automation scripts, Unified DevOps Automation is built around a transparent, explainable pipeline:

$$\text{Repository Evidence} \longrightarrow \text{Explainable Blueprint} \longrightarrow \text{Generated Artifacts} \longrightarrow \text{Human Approval} \longrightarrow \text{Security-Gated Deployment}$$

1. **Repository Evidence Fingerprinting**: Deterministically scans repository files (`package.json`, lockfiles, Maven/Gradle descriptors, existing configs) to infer the stack, scripts, and runtime requirements.
2. **Explainable DevOps Blueprint**: Generates declarative, readable architectural specifications detailing containerization, Kubernetes manifests, quality gates, and registry targets.
3. **Generated Production Artifacts**: Synthesizes verified `Jenkinsfile`, multi-stage hardened `Dockerfile`, Kubernetes Deployment/Service/ConfigMap manifests, and Terraform cloud infrastructure code without embedded secrets.
4. **Human Approval Gate**: Preserves developer control. Consequential deployment configurations must be explicitly reviewed and authorized. Approved blueprints are locked as immutable release records.
5. **Security-Gated Deployment**: Enforces Trivy zero-critical CVE policies and SonarQube quality gates before admission to production clusters.

---

## 2. Architecture & Technology Stack

### Frontend Architecture
- **Framework**: React 18 with TypeScript in strict mode
- **Build Tool**: Vite 6 (custom manual chunking for optimized caching)
- **Styling**: Tailwind CSS matching a refined macOS-inspired enterprise design (Arctic White `#FFFFFF`, Secondary surfaces `#F8FAFC`, Enterprise Blue `#2563EB`, Subtle borders `#E5E7EB`)
- **Routing**: React Router v6 with typed application routes
- **Motion & Animation**: GSAP with `@gsap/react` hooks and full `prefers-reduced-motion` compliance
- **Icons**: Lucide React
- **API Client**: Typed centralized client with configurable timeouts, request cancellation, auth headers, and mock/real mode adapter

### Target Backend Integration
- **Stack**: MERN (MongoDB Atlas, Express.js, React, Node.js)
- **Metadata Store**: MongoDB Atlas via Mongoose models
- **CI/CD Orchestration**: Jenkins Declarative Pipelines
- **Quality & Security**: SonarQube & Trivy
- **Container Registry**: GitHub Container Registry (`ghcr.io`)
- **Workload Target**: Kubernetes (Azure AKS / local clusters)
- **Infrastructure as Code**: Terraform CLI & State
- **Monitoring & Telemetry**: Prometheus & Grafana

---

## 3. Implemented Routes & Navigation

| Route | View | Description |
|---|---|---|
| `/` | **Product Landing Page** | Public positioning, 9-stage architecture walkthrough, ecosystem integrations, CTA |
| `/app` | **Main Dashboard** | Executive KPIs, pipeline success rates, recent runs, security gate status, quick actions |
| `/app/repositories` | **Repository Management** | Searchable table, stack filters, GitHub connection modal, blueprint status |
| `/app/repositories/:id` | **Repository Workspace** | 7 functional tabs: Overview, Evidence, Blueprints, Artifacts, Pipelines, Security, Settings |
| `/app/analyze` | **Repository Analyzer** | Multi-step evidence detection, package manager audit, certainty score, blueprint generator |
| `/app/blueprints` | **DevOps Blueprints** | Immutable blueprint versions, draft/approved states, structured configuration viewer |
| `/app/blueprints/:id` | **Blueprint Detail** | Structured specs, raw JSON viewer, human approval modal with version locking |
| `/app/artifacts` | **Generated Artifacts** | Syntax viewer, copy-to-clipboard, download, `Jenkinsfile`, `Dockerfile`, K8s, Terraform |
| `/app/pipelines` | **CI/CD Management** | 9-stage execution progress, trigger pipeline modal, execution duration and commit SHAs |
| `/app/pipelines/:id` | **Pipeline Execution Detail** | Interactive 9-stage stepper, terminal stage logs viewer, quality gate metrics, failure reasons |
| `/app/security` | **Security & Quality Center** | Trivy CVE table, severity breakdown (Critical/High/Med/Low), SonarQube coverage gates |
| `/app/deployments` | **Deployments** | Kubernetes namespaces, pod replica health, cluster event stream, rollback entry point |
| `/app/infrastructure` | **Infrastructure** | Terraform workspaces, Azure AKS cluster metadata, state drift, dry-run plan execution |
| `/app/observability` | **Observability** | Prometheus CPU/memory SVG timeseries telemetry, RPS throughput, Grafana dashboard links |
| `/app/integrations` | **Integrations** | Central management for all 11 external tools with test-connection actions and setup docs |
| `/app/settings` | **Platform Settings** | Engineer profile, approval enforcement policies, zero-critical thresholds, notifications |

---

## 4. Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22.x recommended)
- **npm**: v9.x or higher

### Installation

```bash
# Clone or navigate to the repository
cd unified-devops-automation

# Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will be accessible at:
```
http://localhost:3000
```

### Building for Production

```bash
# Type check and build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

### TypeScript Type-Checking / Linting

```bash
npm run lint
```

---

## 5. Environment Variables & Modes

Configuration is managed via Vite environment variables. See [`.env.example`](file:///.env.example):

```ini
# Base URL for the Express + Node.js Backend API
VITE_API_BASE_URL=http://localhost:5000/api

# Enable development mock mode (deterministic fixtures and stateful in-memory mock adapter)
# Set to 'false' to communicate with a live backend API server.
VITE_USE_MOCK_DATA=true
```

### Development Mock Mode (`VITE_USE_MOCK_DATA=true`)
- Default mode for local UI testing and evaluation without third-party credentials.
- Uses stateful in-memory adapters (`src/mocks/mockAdapter.ts`) supporting:
  - Connecting new repositories
  - Triggering repository fingerprinting
  - Generating and approving DevOps blueprints
  - Dispatching CI/CD pipelines
  - Testing third-party integration connections
- Labeled honestly with an amber banner indicating simulated data.

### Real API Mode (`VITE_USE_MOCK_DATA=false`)
- Directly dispatches HTTP requests via `src/lib/apiClient.ts` to `VITE_API_BASE_URL`.
- Attaches Bearer authentication headers when available.
- Handles network and HTTP error responses gracefully without fabricating fake production data.

---

## 6. Directory Structure

```
unified-devops-automation/
├── .env.example                # Safe environment variable template
├── .env                        # Local development defaults
├── index.html                  # HTML5 entry point
├── package.json                # Project dependencies and npm scripts
├── postcss.config.js           # PostCSS configuration for Tailwind CSS
├── tailwind.config.js          # Arctic White & Enterprise Blue design system
├── tsconfig.json               # TypeScript project reference root
├── tsconfig.app.json           # App TypeScript strict configuration
├── tsconfig.node.json          # Node configuration for Vite
├── vite.config.ts              # Vite 6 config with manual chunking
└── src/
    ├── app/
    │   ├── providers.tsx       # ErrorBoundary and ToastProvider
    │   └── router.tsx          # Centralized React Router configuration
    ├── components/
    │   ├── common/             # Reusable UI primitives (Button, Card, Modal, Badge, etc.)
    │   │   ├── Badge.tsx
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── CodeViewer.tsx
    │   │   ├── CommandPalette.tsx
    │   │   ├── ConfirmDialog.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── PipelineStageTimeline.tsx
    │   │   ├── Skeleton.tsx
    │   │   ├── StatusPill.tsx
    │   │   ├── Tabs.tsx
    │   │   └── Toast.tsx
    │   └── layout/             # Shell layout (Sidebar, Header, Breadcrumbs, Banners)
    │       ├── AppShell.tsx
    │       ├── Breadcrumbs.tsx
    │       ├── Header.tsx
    │       ├── MockDataBanner.tsx
    │       └── Sidebar.tsx
    ├── features/               # Domain feature modules and pages
    │   ├── analysis/           # Repository evidence analyzer
    │   ├── artifacts/          # Generated configuration files
    │   ├── blueprints/         # DevOps blueprint management and approval
    │   ├── dashboard/          # Main operational dashboard
    │   ├── deployments/        # Kubernetes workload statuses and rollouts
    │   ├── infrastructure/     # Terraform workspaces and state drift
    │   ├── integrations/       # Third-party integrations center
    │   ├── landing/            # Public product showcase
    │   ├── observability/      # Prometheus and Grafana monitoring
    │   ├── pipelines/          # CI/CD executions and stage logs
    │   ├── repositories/       # Repository management and workspace
    │   └── settings/           # Platform preferences and governance
    ├── lib/
    │   ├── animations.ts       # GSAP motion helpers with reduced-motion support
    │   ├── apiClient.ts        # Typed HTTP client
    │   └── utils.ts            # Formatting, cn, dates, durations
    ├── mocks/
    │   ├── fixtures/           # Deterministic domain sample data
    │   └── mockAdapter.ts      # Stateful mock adapter for development
    ├── services/               # Typed domain API service modules
    ├── styles/
    │   └── globals.css         # Global CSS and glassmorphism helpers
    ├── types/
    │   └── index.ts            # Comprehensive TypeScript interfaces
    └── main.tsx                # Application root mount
```

---

## 7. Security & Credentials Notice

- **Zero Exposed Secrets**: No API keys, GitHub tokens, Jenkins credentials, database connection strings, or cloud service principals are stored in browser code.
- **Backend-Mediated Operations**: All privileged third-party actions (triggering builds, pushing images, applying infrastructure changes) must be mediated by the backend server.
- **Truth in Status**: Unconfigured scanners or disconnected endpoints are displayed honestly and are never reported as passing.

---

## 8. License & Authorship

Developed for **Unified DevOps Automation** by Piyush Khandait.
