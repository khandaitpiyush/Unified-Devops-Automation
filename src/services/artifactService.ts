import { apiClient } from '@/lib/apiClient';
import { mockAdapter } from '@/mocks/mockAdapter';
import { ApiResponse, GeneratedArtifact } from '@/types';

export const artifactService = {
  async getArtifacts(): Promise<ApiResponse<GeneratedArtifact[]>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getArtifacts();
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<GeneratedArtifact[]>('/artifacts');
  },

  async getArtifactsByRepo(repoId: string): Promise<ApiResponse<GeneratedArtifact[]>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getArtifactsByRepo(repoId);
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<GeneratedArtifact[]>(`/repositories/${repoId}/artifacts`);
  },

  async regenerateArtifacts(blueprintId: string): Promise<ApiResponse<GeneratedArtifact[]>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.regenerateArtifacts(blueprintId);
      return { data, success: true, isMockData: true };
    }
    return apiClient.post<GeneratedArtifact[]>(`/blueprints/${blueprintId}/generate-artifacts`);
  },
};
