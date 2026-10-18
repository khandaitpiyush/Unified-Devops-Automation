import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '@/features/landing/LandingPage';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { RepositoriesPage } from '@/features/repositories/RepositoriesPage';
import { RepositoryDetailPage } from '@/features/repositories/RepositoryDetailPage';
import { AnalyzerPage } from '@/features/analysis/AnalyzerPage';
import { BlueprintsPage } from '@/features/blueprints/BlueprintsPage';
import { BlueprintDetailPage } from '@/features/blueprints/BlueprintDetailPage';
import { ArtifactsPage } from '@/features/artifacts/ArtifactsPage';
import { PipelinesPage } from '@/features/pipelines/PipelinesPage';
import { PipelineDetailPage } from '@/features/pipelines/PipelineDetailPage';
import { SecurityPage } from '@/features/security/SecurityPage';
import { DeploymentsPage } from '@/features/deployments/DeploymentsPage';
import { InfrastructurePage } from '@/features/infrastructure/InfrastructurePage';
import { ObservabilityPage } from '@/features/observability/ObservabilityPage';
import { IntegrationsPage } from '@/features/integrations/IntegrationsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'repositories',
        element: <RepositoriesPage />,
      },
      {
        path: 'repositories/:repositoryId',
        element: <RepositoryDetailPage />,
      },
      {
        path: 'analyze',
        element: <AnalyzerPage />,
      },
      {
        path: 'blueprints',
        element: <BlueprintsPage />,
      },
      {
        path: 'blueprints/:blueprintId',
        element: <BlueprintDetailPage />,
      },
      {
        path: 'artifacts',
        element: <ArtifactsPage />,
      },
      {
        path: 'pipelines',
        element: <PipelinesPage />,
      },
      {
        path: 'pipelines/:pipelineId',
        element: <PipelineDetailPage />,
      },
      {
        path: 'security',
        element: <SecurityPage />,
      },
      {
        path: 'deployments',
        element: <DeploymentsPage />,
      },
      {
        path: 'infrastructure',
        element: <InfrastructurePage />,
      },
      {
        path: 'observability',
        element: <ObservabilityPage />,
      },
      {
        path: 'integrations',
        element: <IntegrationsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/app" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
