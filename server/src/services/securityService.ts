import { store } from '../store/dataStore.js';
import { SecurityOverview } from '../types/index.js';

export class SecurityService {
  public static getOverview(repoId: string = 'repo-unified-devops'): SecurityOverview {
    if (!store.securityData[repoId]) {
      const repo = store.repositories.find((r) => r.id === repoId);
      store.securityData[repoId] = {
        repositoryId: repoId,
        repositoryName: repo?.name || 'app',
        lastScanDate: new Date().toISOString(),
        scanStatus: 'scanned',
        policyGatePassed: true,
        severityCounts: { critical: 0, high: 0, medium: 1, low: 2 },
        vulnerabilities: [],
        sonarqube: {
          configured: true,
          status: 'OK',
          coverage: 92.5,
          bugs: 0,
          vulnerabilities: 0,
          codeSmells: 1,
        },
      };
    }
    return store.securityData[repoId];
  }

  public static getAll(): Record<string, SecurityOverview> {
    return store.securityData;
  }

  public static runScan(repoId: string = 'repo-unified-devops'): SecurityOverview {
    const sec = this.getOverview(repoId);
    sec.lastScanDate = new Date().toISOString();
    sec.scanStatus = 'scanned';
    sec.policyGatePassed = true;
    return sec;
  }
}
