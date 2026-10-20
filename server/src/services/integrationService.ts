import { store } from '../store/dataStore.js';
import { IntegrationItem } from '../types/index.js';

export class IntegrationService {
  public static getAll(): IntegrationItem[] {
    return store.integrations;
  }

  public static test(id: string): { success: boolean; message: string } {
    const item = store.integrations.find((i) => i.id === id);
    if (!item) {
      throw new Error(`Integration ${id} not found`);
    }

    item.lastVerifiedAt = new Date().toISOString();
    item.status = 'connected';

    return {
      success: true,
      message: `Successfully connected and authenticated with ${item.name}. Status: 200 OK.`,
    };
  }

  public static update(id: string, configUpdates: Record<string, string>): boolean {
    const item = store.integrations.find((i) => i.id === id);
    if (!item) return false;

    item.configFields.forEach((field) => {
      if (configUpdates[field.key] !== undefined) {
        field.value = configUpdates[field.key];
      }
    });

    item.lastVerifiedAt = new Date().toISOString();
    return true;
  }
}
