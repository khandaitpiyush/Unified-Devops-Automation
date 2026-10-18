import { apiClient } from '@/lib/apiClient';
import { mockAdapter } from '@/mocks/mockAdapter';
import { ApiResponse, IntegrationItem } from '@/types';

export const integrationService = {
  async getIntegrations(): Promise<ApiResponse<IntegrationItem[]>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getIntegrations();
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<IntegrationItem[]>('/integrations');
  },

  async testConnection(integrationId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.testIntegration(integrationId);
      return { data, success: true, isMockData: true };
    }
    return apiClient.post<{ success: boolean; message: string }>(`/integrations/${integrationId}/test`);
  },

  async updateConfig(integrationId: string, config: Record<string, string>): Promise<ApiResponse<{ success: boolean }>> {
    if (apiClient.isMockEnabled()) {
      return { data: { success: true }, success: true, isMockData: true };
    }
    return apiClient.put<{ success: boolean }>(`/integrations/${integrationId}`, config);
  },
};
