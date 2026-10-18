import { apiClient } from '@/lib/apiClient';
import { mockAdapter } from '@/mocks/mockAdapter';
import { ApiResponse, SecurityOverview } from '@/types';

export const securityService = {
  async getSecurityOverview(repositoryId?: string): Promise<ApiResponse<SecurityOverview | null>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getSecurityData(repositoryId);
      return { data, success: true, isMockData: true };
    }
    const endpoint = repositoryId ? `/security/${repositoryId}` : '/security/overview';
    return apiClient.get<SecurityOverview | null>(endpoint);
  },

  async getAllSecurity(): Promise<ApiResponse<Record<string, SecurityOverview>>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getAllSecurity();
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<Record<string, SecurityOverview>>('/security');
  },
};
