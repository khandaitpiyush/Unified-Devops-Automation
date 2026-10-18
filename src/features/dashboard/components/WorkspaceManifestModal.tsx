import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { CodeViewer } from '@/components/common/CodeViewer';
import { ScrollText, Download, Check, Copy, FileCode2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/common/Toast';

export interface WorkspaceManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositoryName?: string;
}

export const WorkspaceManifestModal: React.FC<WorkspaceManifestModalProps> = ({
  isOpen,
  onClose,
  repositoryName = 'unified-devops-automation',
}) => {
  const [activeFile, setActiveFile] = useState<'docker' | 'jenkins' | 'k8s_deploy' | 'k8s_svc' | 'tf'>('docker');
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const manifests = {
    docker: {
      name: 'Dockerfile',
      language: 'dockerfile' as const,
      code: `# Multi-stage production build for ${repositoryName}
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]`,
    },
    jenkins: {
      name: 'Jenkinsfile',
      language: 'groovy' as const,
      code: `// Autonomous 9-stage declarative CI/CD pipeline for ${repositoryName}
pipeline {
  agent { label 'kubernetes-runner' }
  environment {
    REGISTRY = 'ghcr.io/khandaitpiyush'
    IMAGE_NAME = '${repositoryName}'
    NAMESPACE = 'production'
  }
  stages {
    stage('1. Checkout Source') {
      steps { checkout scm }
    }
    stage('2. Install Dependencies') {
      steps { sh 'npm ci' }
    }
    stage('3. Run Tests & Lint') {
      steps {
        sh 'npm run lint'
        sh 'npm test -- --coverage'
      }
    }
    stage('4. SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQube-Server') {
          sh 'sonar-scanner -Dsonar.projectKey=${repositoryName}'
        }
      }
    }
    stage('5. Trivy Security Scan') {
      steps {
        sh 'trivy fs --severity CRITICAL,HIGH --exit-code 1 .'
      }
    }
    stage('6. Build Docker Image') {
      steps {
        sh "docker build -t $REGISTRY/$IMAGE_NAME:\${BUILD_NUMBER} ."
      }
    }
    stage('7. Push Image to GHCR') {
      steps {
        sh "docker push $REGISTRY/$IMAGE_NAME:\${BUILD_NUMBER}"
      }
    }
    stage('8. Deploy to Kubernetes') {
      steps {
        sh "kubectl apply -f k8s/ -n $NAMESPACE"
      }
    }
    stage('9. Record Metadata') {
      steps {
        echo "Build \${BUILD_NUMBER} deployed successfully."
      }
    }
  }
}`,
    },
    k8s_deploy: {
      name: 'k8s/deployment.yaml',
      language: 'yaml' as const,
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${repositoryName}
  namespace: production
  labels:
    app.kubernetes.io/name: ${repositoryName}
    app.kubernetes.io/part-of: unified-devops-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${repositoryName}
  template:
    metadata:
      labels:
        app: ${repositoryName}
    spec:
      containers:
        - name: web
          image: ghcr.io/khandaitpiyush/${repositoryName}:v1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 10`,
    },
    k8s_svc: {
      name: 'k8s/service.yaml',
      language: 'yaml' as const,
      code: `apiVersion: v1
kind: Service
metadata:
  name: ${repositoryName}-svc
  namespace: production
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
      name: http
  selector:
    app: ${repositoryName}
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${repositoryName}-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  rules:
    - host: ${repositoryName}.internal
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${repositoryName}-svc
                port:
                  number: 80`,
    },
    tf: {
      name: 'terraform/main.tf',
      language: 'hcl' as const,
      code: `terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-devops-control-plane"
  location = "eastus"
}

resource "azurerm_kubernetes_cluster" "k8s" {
  name                = "aks-devops-eastus-01"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "devops-aks"

  default_node_pool {
    name       = "systempool"
    node_count = 3
    vm_size    = "Standard_D2s_v5"
  }

  identity {
    type = "SystemAssigned"
  }
}`,
    },
  };

  const current = manifests[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    toast.success('Manifest Copied', `${current.name} copied to clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([current.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = current.name.split('/').pop() || 'manifest.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Download Started', `Saved ${current.name}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generated DevOps Manifests & Infrastructure As Code"
      description={`Derived automatically from Blueprint v1.2.0 for ${repositoryName}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Manifest Tabs */}
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-1 overflow-x-auto">
            {(
              [
                { key: 'docker', label: 'Dockerfile' },
                { key: 'jenkins', label: 'Jenkinsfile' },
                { key: 'k8s_deploy', label: 'deployment.yaml' },
                { key: 'k8s_svc', label: 'service.yaml' },
                { key: 'tf', label: 'main.tf' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFile(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activeFile === tab.key
                    ? 'bg-primary-50 text-primary-700 font-semibold border border-primary-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              Copy
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={handleDownload}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download
            </Button>
          </div>
        </div>

        {/* Code Viewer */}
        <CodeViewer
          code={current.code}
          filename={current.name}
          language={current.language}
        />

        <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Target Registry: <code className="text-slate-700 font-mono">ghcr.io/khandaitpiyush</code></span>
          <Link to="/app/artifacts" className="text-primary-600 hover:underline flex items-center gap-1 font-medium">
            Open Full Artifacts Catalog <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </Modal>
  );
};
