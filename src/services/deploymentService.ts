import { apiClient } from '@/lib/apiClient';
import { mockAdapter } from '@/mocks/mockAdapter';
import { ApiResponse, DeploymentItem } from '@/types';

export const deploymentService = {
  async getDeployments(): Promise<ApiResponse<DeploymentItem[]>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getDeployments();
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<DeploymentItem[]>('/deployments');
  },

  async getDeploymentsByRepo(repositoryId: string): Promise<ApiResponse<DeploymentItem[]>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getDeploymentsByRepo(repositoryId);
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<DeploymentItem[]>(`/repositories/${repositoryId}/deployments`);
  },
};
