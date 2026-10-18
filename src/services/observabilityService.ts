import { apiClient } from '@/lib/apiClient';
import { mockAdapter } from '@/mocks/mockAdapter';
import { ApiResponse, ObservabilityMetrics } from '@/types';

export const observabilityService = {
  async getMetrics(): Promise<ApiResponse<ObservabilityMetrics>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getObservability();
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<ObservabilityMetrics>('/observability/metrics');
  },
};
