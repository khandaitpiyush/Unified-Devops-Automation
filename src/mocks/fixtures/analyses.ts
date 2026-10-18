import { AnalysisResult } from '@/types';

export const mockAnalyses: Record<string, AnalysisResult> = {
  'repo-unified-devops': {
    id: 'analysis-unified-devops-01',
    repositoryId: 'repo-unified-devops',
    status: 'completed',
    analyzedAt: '2026-10-18T10:15:00Z',
    detectedStack: {
      framework: 'React 18 + Vite',
      runtime: 'Node.js 22',
      version: '1.0.0',
      language: 'TypeScript',
    },
    packageManager: {
      name: 'npm',
      lockfilePresent: true,
    },
    scripts: {
      build: 'tsc -b && vite build',
      test: 'vitest run',
      start: 'vite preview',
      dev: 'vite',
      lint: 'tsc --noEmit',
    },
    existingConfig: {
      hasDockerfile: true,
      hasKubernetes: true,
      hasJenkinsfile: true,
      hasTerraform: true,
    },
    evidence: [
      {
        category: 'stack',
        file: 'package.json',
        snippet: '"dependencies": { "react": "^18.3.1", "vite": "^6.0.1" }',
        matchedRule: 'react_vite_fingerprint',
        confidence: 'high',
      },
      {
        category: 'package_manager',
        file: 'package-lock.json',
        snippet: '"lockfileVersion": 3',
        matchedRule: 'npm_lockfile_v3',
        confidence: 'high',
      },
      {
        category: 'scripts',
        file: 'package.json',
        snippet: '"build": "tsc -b && vite build"',
        matchedRule: 'npm_script_build',
        confidence: 'high',
      },
      {
        category: 'docker',
        file: 'Dockerfile',
        snippet: 'FROM node:22-alpine AS builder',
        matchedRule: 'multistage_dockerfile',
        confidence: 'high',
      },
      {
        category: 'kubernetes',
        file: 'k8s/deployment.yaml',
        snippet: 'kind: Deployment\nmetadata:\n  name: unified-devops-web',
        matchedRule: 'k8s_deployment_manifest',
        confidence: 'high',
      },
      {
        category: 'ci',
        file: 'Jenkinsfile',
        snippet: 'pipeline {\n  agent any\n  stages {',
        matchedRule: 'declarative_jenkinsfile',
        confidence: 'high',
      },
    ],
    missingRequirements: [
      'Container HEALTHCHECK instruction recommended in production stage',
      'Kubernetes Resource Limit Memory set slightly low for build peaks',
    ],
    warnings: [
      'SonarQube project token must be supplied via Jenkins credentials store, not embedded in repo.',
    ],
    confidenceScore: 96,
    recommendedBlueprintTemplate: 'react-vite-k8s-enterprise',
  },
  'repo-storefront-react': {
    id: 'analysis-storefront-02',
    repositoryId: 'repo-storefront-react',
    status: 'completed',
    analyzedAt: '2026-10-18T11:45:00Z',
    detectedStack: {
      framework: 'React / Next.js',
      runtime: 'Node.js 20 LTS',
      version: '14.2.0',
      language: 'TypeScript',
    },
    packageManager: {
      name: 'pnpm',
      lockfilePresent: true,
    },
    scripts: {
      build: 'next build',
      test: 'jest --passWithNoTests',
      start: 'next start',
      dev: 'next dev',
    },
    existingConfig: {
      hasDockerfile: true,
      hasKubernetes: true,
      hasJenkinsfile: false,
      hasTerraform: false,
    },
    evidence: [
      {
        category: 'stack',
        file: 'package.json',
        snippet: '"next": "14.2.0"',
        matchedRule: 'nextjs_framework',
        confidence: 'high',
      },
      {
        category: 'package_manager',
        file: 'pnpm-lock.yaml',
        snippet: 'lockfileVersion: 5.4',
        matchedRule: 'pnpm_lockfile',
        confidence: 'high',
      },
    ],
    missingRequirements: [
      'No declarative Jenkinsfile detected in repository root.',
      'Infrastructure as Code (Terraform) module missing.',
    ],
    warnings: [
      'Next.js standalone output mode must be enabled in next.config.js for optimized Docker containerization.',
    ],
    confidenceScore: 92,
    recommendedBlueprintTemplate: 'nextjs-k8s-ghcr-pipeline',
  },
  'repo-payments-api': {
    id: 'analysis-payments-03',
    repositoryId: 'repo-payments-api',
    status: 'completed',
    analyzedAt: '2026-10-17T18:30:00Z',
    detectedStack: {
      framework: 'Spring Boot 3.2',
      runtime: 'OpenJDK 21',
      version: '3.2.4',
      language: 'Java',
    },
    packageManager: {
      name: 'Maven',
      lockfilePresent: true,
    },
    scripts: {
      build: 'mvn clean package -DskipTests=false',
      test: 'mvn test',
    },
    existingConfig: {
      hasDockerfile: false,
      hasKubernetes: false,
      hasJenkinsfile: true,
      hasTerraform: false,
    },
    evidence: [
      {
        category: 'stack',
        file: 'pom.xml',
        snippet: '<groupId>org.springframework.boot</groupId>',
        matchedRule: 'spring_boot_parent',
        confidence: 'high',
      },
      {
        category: 'ci',
        file: 'Jenkinsfile',
        snippet: 'pipeline { ... }',
        matchedRule: 'jenkinsfile_present',
        confidence: 'medium',
      },
    ],
    missingRequirements: [
      'Dockerfile missing. Multistage eclipse-temurin:21 containerization blueprint required.',
      'Kubernetes Deployment and Service manifests required.',
    ],
    warnings: [
      'Payment service handles PCI-DSS scope data. Trivy zero-critical vulnerability gate strictly required.',
    ],
    confidenceScore: 88,
    recommendedBlueprintTemplate: 'spring-boot-maven-enterprise-k8s',
  },
};
