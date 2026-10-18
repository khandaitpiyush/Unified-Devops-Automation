import { GeneratedArtifact } from '@/types';

export const mockArtifacts: GeneratedArtifact[] = [
  {
    id: 'art-jenkinsfile-01',
    blueprintId: 'bp-unified-v1',
    blueprintVersion: 'v1.0.0',
    repositoryId: 'repo-unified-devops',
    filename: 'Jenkinsfile',
    fileType: 'jenkinsfile',
    language: 'groovy',
    status: 'generated',
    updatedAt: '2026-10-18T10:45:00Z',
    content: `pipeline {
  agent any
  environment {
    REGISTRY = 'ghcr.io'
    IMAGE_NAME = 'khandaitpiyush/unified-devops-automation'
    IMAGE_TAG = "\${env.GIT_COMMIT.take(7)}-\${env.BUILD_NUMBER}"
    K8S_NAMESPACE = 'devops-control-plane'
    SONAR_PROJECT_KEY = 'devops-automation-web'
  }
  stages {
    stage('1. Checkout Source') {
      steps {
        checkout scm
        echo "Checked out commit: \${env.GIT_COMMIT}"
      }
    }
    stage('2. Install Dependencies') {
      steps {
        sh 'npm ci'
      }
    }
    stage('3. Run Lint & Tests') {
      steps {
        sh 'npm run lint'
      }
    }
    stage('4. SonarQube Quality Gate') {
      steps {
        withSonarQubeEnv('SonarQube-Enterprise') {
          sh "npm run lint"
        }
        timeout(time: 5, unit: 'MINUTES') {
          script {
            waitForQualityGate abortPipeline: true
          }
        }
      }
    }
    stage('5. Trivy Security Scan') {
      steps {
        sh 'trivy fs --severity HIGH,CRITICAL --exit-code 1 --no-progress .'
      }
    }
    stage('6. Build Docker Image') {
      steps {
        sh "docker build -t \${REGISTRY}/\${IMAGE_NAME}:\${IMAGE_TAG} ."
      }
    }
    stage('7. Push Image to GHCR') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'GHCR_CREDENTIALS', usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
          sh "echo \$GH_TOKEN | docker login ghcr.io -u \$GH_USER --password-stdin"
          sh "docker push \${REGISTRY}/\${IMAGE_NAME}:\${IMAGE_TAG}"
        }
      }
    }
    stage('8. Deploy to Kubernetes') {
      steps {
        sh """
          kubectl apply -f k8s/configmap.yaml -n \${K8S_NAMESPACE}
          kubectl apply -f k8s/service.yaml -n \${K8S_NAMESPACE}
          kubectl set image deployment/unified-devops-web web=\${REGISTRY}/\${IMAGE_NAME}:\${IMAGE_TAG} -n \${K8S_NAMESPACE}
          kubectl rollout status deployment/unified-devops-web -n \${K8S_NAMESPACE} --timeout=180s
        """
      }
    }
    stage('9. Record Deployment Metadata') {
      steps {
        echo "Successfully deployed \${IMAGE_NAME}:\${IMAGE_TAG} to namespace \${K8S_NAMESPACE}"
      }
    }
  }
  post {
    always {
      cleanWs()
    }
    failure {
      echo "DevOps Pipeline Execution Failed. Inspect stage logs for remediation."
    }
  }
}`,
  },
  {
    id: 'art-dockerfile-01',
    blueprintId: 'bp-unified-v1',
    blueprintVersion: 'v1.0.0',
    repositoryId: 'repo-unified-devops',
    filename: 'Dockerfile',
    fileType: 'dockerfile',
    language: 'dockerfile',
    status: 'generated',
    updatedAt: '2026-10-18T10:45:00Z',
    content: `# Multi-stage Build for Optimized Production Image
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Non-root user for enterprise container hardening
USER node
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/dist ./dist
RUN npm ci --omit=dev --ignore-scripts

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["npm", "run", "preview"]`,
  },
  {
    id: 'art-k8s-deploy-01',
    blueprintId: 'bp-unified-v1',
    blueprintVersion: 'v1.0.0',
    repositoryId: 'repo-unified-devops',
    filename: 'k8s/deployment.yaml',
    fileType: 'k8s_deployment',
    language: 'yaml',
    status: 'generated',
    updatedAt: '2026-10-18T10:45:00Z',
    content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: unified-devops-web
  namespace: devops-control-plane
  labels:
    app.kubernetes.io/name: unified-devops-web
    app.kubernetes.io/part-of: unified-devops-automation
    app.kubernetes.io/managed-by: blueprint-v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: unified-devops-web
  template:
    metadata:
      labels:
        app: unified-devops-web
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
      containers:
        - name: web
          image: ghcr.io/khandaitpiyush/unified-devops-automation:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
              name: http
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 500m
              memory: 1Gi
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
          envFrom:
            - configMapRef:
                name: unified-devops-config`,
  },
  {
    id: 'art-k8s-service-01',
    blueprintId: 'bp-unified-v1',
    blueprintVersion: 'v1.0.0',
    repositoryId: 'repo-unified-devops',
    filename: 'k8s/service.yaml',
    fileType: 'k8s_service',
    language: 'yaml',
    status: 'generated',
    updatedAt: '2026-10-18T10:45:00Z',
    content: `apiVersion: v1
kind: Service
metadata:
  name: unified-devops-service
  namespace: devops-control-plane
  labels:
    app: unified-devops-web
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
      name: http
  selector:
    app: unified-devops-web`,
  },
  {
    id: 'art-k8s-configmap-01',
    blueprintId: 'bp-unified-v1',
    blueprintVersion: 'v1.0.0',
    repositoryId: 'repo-unified-devops',
    filename: 'k8s/configmap.yaml',
    fileType: 'k8s_configmap',
    language: 'yaml',
    status: 'generated',
    updatedAt: '2026-10-18T10:45:00Z',
    content: `apiVersion: v1
kind: ConfigMap
metadata:
  name: unified-devops-config
  namespace: devops-control-plane
data:
  NODE_ENV: "production"
  PORT: "3000"
  ENABLE_METRICS: "true"
  METRICS_PORT: "3000"`,
  },
  {
    id: 'art-terraform-01',
    blueprintId: 'bp-unified-v1',
    blueprintVersion: 'v1.0.0',
    repositoryId: 'repo-unified-devops',
    filename: 'terraform/main.tf',
    fileType: 'terraform_main',
    language: 'hcl',
    status: 'generated',
    updatedAt: '2026-10-18T10:45:00Z',
    content: `terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg_devops" {
  name     = var.resource_group_name
  location = var.location
  tags = {
    Environment = var.environment
    ManagedBy   = "UnifiedDevOpsAutomation"
  }
}

resource "azurerm_kubernetes_cluster" "aks_devops" {
  name                = var.cluster_name
  location            = azurerm_resource_group.rg_devops.location
  resource_group_name = azurerm_resource_group.rg_devops.name
  dns_prefix          = "devops-aks"

  default_node_pool {
    name       = "systempool"
    node_count = var.node_count
    vm_size    = "Standard_D2s_v5"
    os_disk_size_gb = 64
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = var.environment
  }
}`,
  },
];
