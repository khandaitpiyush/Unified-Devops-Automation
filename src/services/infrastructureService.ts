import { apiClient } from '@/lib/apiClient';
import { mockAdapter } from '@/mocks/mockAdapter';
import { ApiResponse, InfrastructureItem } from '@/types';

export const infrastructureService = {
  async getInfrastructure(): Promise<ApiResponse<InfrastructureItem[]>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getInfrastructure();
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<InfrastructureItem[]>('/infrastructure');
  },

  async runTerraformPlan(infraId: string): Promise<ApiResponse<{ status: string; planOutput: string }>> {
    if (apiClient.isMockEnabled()) {
      return {
        data: {
          status: 'success',
          planOutput: 'Terraform Plan simulated output: 0 to add, 0 to change, 0 to destroy. State is in sync.',
        },
        success: true,
        isMockData: true,
      };
    }
    return apiClient.post<{ status: string; planOutput: string }>(`/infrastructure/${infraId}/plan`);
  },
};
