import { apiClient } from '@/lib/apiClient';
import { mockAdapter } from '@/mocks/mockAdapter';
import { ApiResponse, Repository } from '@/types';

export const repositoryService = {
  async getRepositories(): Promise<ApiResponse<Repository[]>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getRepositories();
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<Repository[]>('/repositories');
  },

  async getRepositoryById(id: string): Promise<ApiResponse<Repository | null>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getRepositoryById(id);
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<Repository | null>(`/repositories/${id}`);
  },

  async connectRepository(repo: Partial<Repository>): Promise<ApiResponse<Repository>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.connectRepository(repo);
      return { data, success: true, isMockData: true };
    }
    return apiClient.post<Repository>('/repositories/connect', repo);
  },
};
