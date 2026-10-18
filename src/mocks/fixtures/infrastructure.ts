import { InfrastructureItem } from '@/types';

export const mockInfrastructure: InfrastructureItem[] = [
  {
    id: 'infra-aks-prod',
    provider: 'azure',
    clusterName: 'aks-devops-eastus-01',
    region: 'East US 2',
    environment: 'production',
    stateStatus: 'synchronized',
    terraformVersion: '1.8.2',
    managedResourcesCount: 14,
    lastApplyAt: '2026-10-18T09:00:00Z',
    planHistory: [
      {
        id: 'plan-01',
        action: 'apply',
        status: 'success',
        timestamp: '2026-10-18T09:00:00Z',
        resourcesAdded: 0,
        resourcesChanged: 2,
        resourcesDestroyed: 0,
        outputSnippet: 'Apply complete! Resources: 0 added, 2 changed, 0 destroyed.\nOutputs:\naks_cluster_name = "aks-devops-eastus-01"\nresource_group = "rg-devops-platform"',
      },
      {
        id: 'plan-02',
        action: 'plan',
        status: 'success',
        timestamp: '2026-10-17T14:30:00Z',
        resourcesAdded: 1,
        resourcesChanged: 0,
        resourcesDestroyed: 0,
        outputSnippet: 'Plan: 1 to add, 0 to change, 0 to destroy.\n+ azurerm_container_registry_token.ci_bot',
      },
    ],
  },
  {
    id: 'infra-k8s-local',
    provider: 'kubernetes-local',
    clusterName: 'kind-devops-sandbox',
    region: 'local-node',
    environment: 'development',
    stateStatus: 'synchronized',
    terraformVersion: '1.8.2',
    managedResourcesCount: 6,
    lastApplyAt: '2026-10-15T11:00:00Z',
    planHistory: [],
  },
];
