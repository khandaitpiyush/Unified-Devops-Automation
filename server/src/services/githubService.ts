import { config } from '../config/env.js';

export interface GitHubRepoSummary {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  default_branch: string;
  language: string | null;
  visibility: 'public' | 'private';
  updated_at: string;
}

export interface GitHubUserProfile {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
}

export class GitHubService {
  private static getHeaders() {
    const token = process.env.GITHUB_TOKEN || config.githubClientSecret;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Unified-Devops-Automation-Platform',
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    return headers;
  }

  // 1. Get current authenticated user profile
  public static async getAuthenticatedUser(): Promise<GitHubUserProfile> {
    const res = await fetch('https://api.github.com/user', {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as GitHubUserProfile;
  }

  // 2. Fetch authenticated user's real repositories
  public static async getUserRepositories(perPage = 30): Promise<GitHubRepoSummary[]> {
    const res = await fetch(`https://api.github.com/user/repos?per_page=${perPage}&sort=updated`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`GitHub API error fetching repositories: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as GitHubRepoSummary[];
  }

  // 3. Get repository details
  public static async getRepo(owner: string, repo: string): Promise<GitHubRepoSummary> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch repo ${owner}/${repo}: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as GitHubRepoSummary;
  }

  // 4. Fetch specific file content (e.g. package.json, pom.xml, Dockerfile)
  public static async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref = 'main'
  ): Promise<string | null> {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { content?: string; encoding?: string };
      if (data.content && data.encoding === 'base64') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch {
      return null;
    }
  }

  // 5. Fetch repository root tree to inspect file existence
  public static async getRepoTree(
    owner: string,
    repo: string,
    ref = 'main'
  ): Promise<Array<{ path: string; type: string }>> {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { tree?: Array<{ path: string; type: string }> };
      return data.tree || [];
    } catch {
      return [];
    }
  }

  // 6. Commit generated artifact (Dockerfile, Jenkinsfile, K8s manifests) into repository
  public static async commitFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    commitMessage: string,
    branch = 'main'
  ): Promise<{ success: boolean; sha?: string }> {
    try {
      // Check if file already exists to get its SHA
      let sha: string | undefined;
      const existingRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        { headers: this.getHeaders() }
      );
      if (existingRes.ok) {
        const existingData = (await existingRes.json()) as {
          sha?: string;
          content?: string;
          encoding?: string;
        };
        sha = existingData.sha;
        // Avoid redundant commits if file content is already up-to-date
        if (existingData.content && existingData.encoding === 'base64') {
          const currentContent = Buffer.from(existingData.content, 'base64').toString('utf-8');
          if (currentContent.trim() === content.trim()) {
            return { success: true, sha };
          }
        }
      }

      const body: Record<string, any> = {
        message: commitMessage,
        content: Buffer.from(content).toString('base64'),
        branch,
      };
      if (sha) {
        body.sha = sha;
      }

      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!putRes.ok) {
        const err = await putRes.text();
        throw new Error(`Failed to commit file to GitHub: ${err}`);
      }

      const resData = (await putRes.json()) as { content?: { sha?: string } };
      return { success: true, sha: resData.content?.sha };
    } catch (error: any) {
      console.error(`Error committing file ${path} to GitHub:`, error.message);
      return { success: false };
    }
  }

  // 7. Trigger a GitHub Actions Workflow in the cloud via workflow_dispatch
  public static async triggerWorkflowDispatch(
    owner: string,
    repo: string,
    workflowFileName: string,
    ref = 'main'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFileName}/dispatches`,
        {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ref }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        return { success: false, message: `Workflow dispatch status ${res.status}: ${text}` };
      }

      return { success: true, message: `Successfully dispatched ${workflowFileName} on branch ${ref}` };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // 8. Get recent workflow runs from GitHub Actions
  public static async getWorkflowRuns(
    owner: string,
    repo: string,
    perPage = 5
  ): Promise<any[]> {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=${perPage}`,
        { headers: this.getHeaders() }
      );
      if (!res.ok) return [];
      const data = (await res.json()) as { workflow_runs?: any[] };
      return data.workflow_runs || [];
    } catch {
      return [];
    }
  }
}
