import { apiClient } from '@/lib/apiClient';
import { ApiResponse } from '@/types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'DevOps Engineer' | 'Platform Lead' | 'Developer';
  githubUsername: string;
}

const mockUser: UserProfile = {
  id: 'usr-devops-01',
  name: 'Piyush Khandait',
  email: 'piyush@unified-devops.internal',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  role: 'DevOps Engineer',
  githubUsername: 'khandaitpiyush',
};

export const authService = {
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    if (apiClient.isMockEnabled()) {
      return { data: mockUser, success: true, isMockData: true };
    }
    return apiClient.get<UserProfile>('/auth/me');
  },

  async initiateGitHubOAuth(): Promise<{ url: string }> {
    if (apiClient.isMockEnabled()) {
      return { url: '/app/repositories?oauth=simulated_success' };
    }
    const res = await apiClient.get<{ url: string }>('/auth/github/authorize');
    return res.data;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
};
