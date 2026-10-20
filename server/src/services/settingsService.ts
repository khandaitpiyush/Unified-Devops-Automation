import { store } from '../store/dataStore.js';
import { PlatformSettings } from '../types/index.js';

export class SettingsService {
  public static get(): PlatformSettings {
    return store.settings;
  }

  public static update(updates: Partial<PlatformSettings>): PlatformSettings {
    if (updates.general) {
      Object.assign(store.settings.general, updates.general);
    }
    if (updates.security) {
      Object.assign(store.settings.security, updates.security);
    }
    if (updates.notifications) {
      Object.assign(store.settings.notifications, updates.notifications);
    }
    return store.settings;
  }
}
