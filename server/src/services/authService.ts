import { store } from '../store/dataStore.js';
import { UserProfile } from '../types/index.js';
import { config } from '../config/env.js';

export class AuthService {
  public static getCurrentUser(): UserProfile {
    return store.currentUser;
  }

  public static getGitHubOAuthUrl(): { url: string } {
    const redirectUri = encodeURIComponent(`http://localhost:${config.port}/api/auth/github/callback`);
    const url = `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&scope=repo,read:user,workflow&redirect_uri=${redirectUri}`;
    return { url };
  }
}
