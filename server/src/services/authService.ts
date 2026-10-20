import { store } from '../store/dataStore.js';
import { UserProfile } from '../types/index.js';
import { config } from '../config/env.js';
import { GitHubService } from './githubService.js';

export class AuthService {
  public static async getCurrentUser(): Promise<UserProfile> {
    try {
      if (process.env.GITHUB_TOKEN) {
        const ghUser = await GitHubService.getAuthenticatedUser();
        return {
          id: `usr-${ghUser.id}`,
          name: ghUser.name || ghUser.login,
          email: ghUser.email || `${ghUser.login}@users.noreply.github.com`,
          avatarUrl: ghUser.avatar_url,
          role: 'Platform Lead',
          githubUsername: ghUser.login,
        };
      }
    } catch (err: any) {
      console.warn('Could not fetch GitHub user directly, using cached profile:', err.message);
    }
    return store.currentUser;
  }

  public static getGitHubOAuthUrl(): { url: string } {
    const redirectUri = encodeURIComponent(`http://localhost:${config.port}/api/auth/github/callback`);
    const url = `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&scope=repo,read:user,workflow&redirect_uri=${redirectUri}`;
    return { url };
  }
}
