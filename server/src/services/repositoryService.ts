import { store } from '../store/dataStore.js';
import { Repository } from '../types/index.js';
import { RepoAnalyzer } from '../analyzers/repoAnalyzer.js';
import { GitHubService } from './githubService.js';

export class RepositoryService {
  private static syncedWithGitHub = false;

  public static async getAll(): Promise<Repository[]> {
    if (!this.syncedWithGitHub && process.env.GITHUB_TOKEN) {
      try {
        const ghRepos = await GitHubService.getUserRepositories(15);
        ghRepos.forEach((gh) => {
          const exists = store.repositories.some((r) => r.fullName.toLowerCase() === gh.full_name.toLowerCase());
          if (!exists) {
            const repo: Repository = {
              id: `repo-${gh.id}`,
              name: gh.name,
              owner: gh.owner.login,
              fullName: gh.full_name,
              defaultBranch: gh.default_branch || 'main',
              language: gh.language || 'TypeScript',
              description: gh.description || `Connected repository ${gh.full_name}`,
              visibility: gh.visibility,
              url: gh.html_url,
              connectionStatus: 'connected',
              latestPipelineStatus: 'none',
              latestDeploymentStatus: 'none',
              blueprintStatus: 'draft',
              lastAnalyzedAt: new Date().toISOString(),
            };
            store.repositories.push(repo);
            store.analyses[repo.id] = RepoAnalyzer.analyze(repo);
          }
        });
        this.syncedWithGitHub = true;
      } catch (err: any) {
        console.warn('GitHub repo sync skipped:', err.message);
      }
    }
    return store.repositories;
  }

  public static getById(id: string): Repository | null {
    return store.repositories.find((r) => r.id === id) || null;
  }

  public static connect(data: Partial<Repository>): Repository {
    const newRepo: Repository = {
      id: `repo-${Date.now()}`,
      name: data.name || 'new-repository',
      owner: data.owner || 'current-user',
      fullName: data.fullName || `${data.owner || 'current-user'}/${data.name || 'new-repository'}`,
      defaultBranch: data.defaultBranch || 'main',
      language: data.language || 'TypeScript',
      description: data.description || 'Connected repository on Unified DevOps Automation Platform.',
      visibility: data.visibility || 'public',
      url: data.url || `https://github.com/${data.owner || 'current-user'}/${data.name || 'new-repository'}`,
      connectionStatus: 'connected',
      latestPipelineStatus: 'none',
      latestDeploymentStatus: 'none',
      blueprintStatus: 'draft',
      lastAnalyzedAt: new Date().toISOString(),
    };

    store.repositories.unshift(newRepo);

    // Automatically trigger initial repository analysis
    store.analyses[newRepo.id] = RepoAnalyzer.analyze(newRepo);

    return newRepo;
  }

  public static delete(id: string): boolean {
    const idx = store.repositories.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    store.repositories.splice(idx, 1);
    delete store.analyses[id];
    return true;
  }
}
