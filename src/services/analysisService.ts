import { apiClient } from '@/lib/apiClient';
import { mockAdapter } from '@/mocks/mockAdapter';
import { ApiResponse, AnalysisResult } from '@/types';

export const analysisService = {
  async getAnalysis(repositoryId: string): Promise<ApiResponse<AnalysisResult | null>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getAnalysis(repositoryId);
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<AnalysisResult | null>(`/repositories/${repositoryId}/analysis`);
  },

  async triggerAnalysis(repositoryId: string): Promise<ApiResponse<AnalysisResult>> {
    if (apiClient.isMockEnabled()) {
      // Simulate realistic analysis time
      await new Promise((resolve) => setTimeout(resolve, 800));
      const data = await mockAdapter.triggerAnalysis(repositoryId);
      return { data, success: true, isMockData: true };
    }
    return apiClient.post<AnalysisResult>(`/repositories/${repositoryId}/analyze`);
  },
};
