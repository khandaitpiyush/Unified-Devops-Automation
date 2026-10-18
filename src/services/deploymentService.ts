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

  async scaleDeployment(deploymentId: string, replicas: number): Promise<ApiResponse<DeploymentItem>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.scaleDeployment(deploymentId, replicas);
      return { data, success: true, isMockData: true };
    }
    return apiClient.patch<DeploymentItem>(`/deployments/${deploymentId}/scale`, { replicas });
  },

  async rollbackDeployment(deploymentId: string): Promise<ApiResponse<DeploymentItem>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.rollbackDeployment(deploymentId);
      return { data, success: true, isMockData: true };
    }
    return apiClient.post<DeploymentItem>(`/deployments/${deploymentId}/rollback`, {});
  },
};

