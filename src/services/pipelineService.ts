import { apiClient } from '@/lib/apiClient';
import { mockAdapter } from '@/mocks/mockAdapter';
import { ApiResponse, PipelineExecution } from '@/types';

export const pipelineService = {
  async getPipelines(): Promise<ApiResponse<PipelineExecution[]>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getPipelines();
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<PipelineExecution[]>('/pipelines');
  },

  async getPipelineById(id: string): Promise<ApiResponse<PipelineExecution | null>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.getPipelineById(id);
      return { data, success: true, isMockData: true };
    }
    return apiClient.get<PipelineExecution | null>(`/pipelines/${id}`);
  },

  async triggerPipeline(repositoryId: string, branch: string = 'main'): Promise<ApiResponse<PipelineExecution>> {
    if (apiClient.isMockEnabled()) {
      const data = await mockAdapter.triggerPipeline(repositoryId, branch);
      return { data, success: true, isMockData: true };
    }
    return apiClient.post<PipelineExecution>(`/repositories/${repositoryId}/pipeline/trigger`, { branch });
  },
};
