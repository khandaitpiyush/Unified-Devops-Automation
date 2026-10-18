import { apiClient } from '@/lib/apiClient';
import { mockAdapter } from '@/mocks/mockAdapter';
import { ApiResponse, DevOpsBlueprint } from '@/types';

export const blueprintService = {
  async getBlueprints(): Promise<ApiResponse<DevOpsBlueprint[]>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getBlueprints();
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<DevOpsBlueprint[]>('/blueprints');
  },

  async getBlueprintById(id: string): Promise<ApiResponse<DevOpsBlueprint | null>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getBlueprintById(id);
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<DevOpsBlueprint | null>(`/blueprints/${id}`);
  },

  async getBlueprintsByRepo(repoId: string): Promise<ApiResponse<DevOpsBlueprint[]>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getBlueprintsByRepo(repoId);
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<DevOpsBlueprint[]>(`/repositories/${repoId}/blueprints`);
  },

  async approveBlueprint(blueprintId: string): Promise<ApiResponse<DevOpsBlueprint>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.approveBlueprint(blueprintId);
      return { data, success: true, isMockData: true };
    }
    return apiClient.post<DevOpsBlueprint>(`/blueprints/${blueprintId}/approve`);
  },

  async createBlueprint(bpData: Partial<DevOpsBlueprint>): Promise<ApiResponse<DevOpsBlueprint>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.createBlueprint(bpData);
      return { data, success: true, isMockData: true };
    }
    return apiClient.post<DevOpsBlueprint>('/blueprints', bpData);
  },
};
