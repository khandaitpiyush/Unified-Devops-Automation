import { store } from '../store/dataStore.js';
import { InfrastructureItem } from '../types/index.js';

export class InfrastructureService {
  public static getAll(): InfrastructureItem[] {
    return store.infrastructure;
  }

  public static plan(infraId: string): { status: string; planOutput: string } {
    const item = store.infrastructure.find((i) => i.id === infraId);
    if (!item) {
      throw new Error(`Infrastructure item ${infraId} not found`);
    }

    item.stateStatus = 'synchronized';
    return {
      status: 'success',
      planOutput: `Terraform v${item.terraformVersion}
Refreshing state... [id=/subscriptions/.../resourceGroups/rg-devops-control-plane]
azurerm_resource_group.rg: Refreshing state...
azurerm_kubernetes_cluster.k8s: Refreshing state...

No changes. Your infrastructure matches the configuration.
Terraform has compared your real infrastructure against your configuration and found no differences.`,
    };
  }
}
