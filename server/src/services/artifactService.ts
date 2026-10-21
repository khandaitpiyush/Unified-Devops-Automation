import { store } from '../store/dataStore.js';
import { GeneratedArtifact } from '../types/index.js';
import { ArtifactGenerator } from '../generators/artifactGenerator.js';

export class ArtifactService {
  public static getAll(): GeneratedArtifact[] {
    return store.artifacts;
  }

  public static getByRepoId(repoId: string): GeneratedArtifact[] {
    const existing = store.artifacts.filter((a) => a.repositoryId === repoId);
    if (existing.length > 0) return existing;

    const bp = store.blueprints.find((b) => b.repositoryId === repoId);
    if (bp) {
      const generated = ArtifactGenerator.generateAll(bp);
      store.artifacts.push(...generated);
      return store.artifacts.filter((a) => a.repositoryId === repoId);
    }
    return [];
  }

  public static regenerate(blueprintId: string): GeneratedArtifact[] {
    const bp = store.blueprints.find((b) => b.id === blueprintId);
    if (!bp) {
      throw new Error(`Blueprint ${blueprintId} not found`);
    }

    const newArtifacts = ArtifactGenerator.generateAll(bp);
    // Replace old artifacts for this blueprint
    store.artifacts = store.artifacts.filter((a) => a.blueprintId !== blueprintId);
    store.artifacts.push(...newArtifacts);

    return newArtifacts;
  }
}
