import { store } from '../store/dataStore.js';
import { AnalysisResult } from '../types/index.js';
import { RepoAnalyzer } from '../analyzers/repoAnalyzer.js';

export class AnalysisService {
  public static getByRepoId(repoId: string): AnalysisResult | null {
    return store.analyses[repoId] || null;
  }

  public static runAnalysis(repoId: string): AnalysisResult {
    const repo = store.repositories.find((r) => r.id === repoId);
    if (!repo) {
      throw new Error(`Repository with ID ${repoId} not found`);
    }

    const result = RepoAnalyzer.analyze(repo);
    store.analyses[repoId] = result;
    repo.lastAnalyzedAt = result.analyzedAt;

    return result;
  }
}
