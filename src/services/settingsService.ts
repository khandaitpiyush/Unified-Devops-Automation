import { apiClient } from '@/lib/apiClient';
import { ApiResponse } from '@/types';

export interface PlatformSettings {
  general: {
    platformName: string;
    environment: 'production' | 'staging' | 'development';
    requireBlueprintApproval: boolean;
    autoTriggerOnPush: boolean;
  };
  security: {
    enforceZeroCriticalCVE: boolean;
    minSonarCodeCoverage: number;
    blockedDeploymentAlerts: boolean;
  };
  notifications: {
    slackWebhookConfigured: boolean;
    emailAlertsEnabled: boolean;
  };
}

const mockSettings: PlatformSettings = {
  general: {
    platformName: 'Unified DevOps Automation',
    environment: 'production',
    requireBlueprintApproval: true,
    autoTriggerOnPush: true,
  },
  security: {
    enforceZeroCriticalCVE: true,
    minSonarCodeCoverage: 80,
    blockedDeploymentAlerts: true,
  },
  notifications: {
    slackWebhookConfigured: true,
    emailAlertsEnabled: true,
  },
};

export const settingsService = {
  async getSettings(): Promise<ApiResponse<PlatformSettings>> {
    if (apiClient.isMockEnabled()) {
      return { data: { ...mockSettings }, success: true, isMockData: true };
    }
    return apiClient.get<PlatformSettings>('/settings');
  },

  async updateSettings(settings: Partial<PlatformSettings>): Promise<ApiResponse<PlatformSettings>> {
    if (apiClient.isMockEnabled()) {
      Object.assign(mockSettings, settings);
      return { data: { ...mockSettings }, success: true, isMockData: true };
    }
    return apiClient.put<PlatformSettings>('/settings', settings);
  },
};
