import { store } from '../store/dataStore.js';
import { ObservabilityMetrics } from '../types/index.js';

export class ObservabilityService {
  public static getMetrics(): ObservabilityMetrics {
    // Dynamic small variations to show real-time live telemetry
    const baseCpu = 28;
    const baseMemory = 41;
    const deltaCpu = Math.floor(Math.random() * 5) - 2;
    const deltaMem = Math.floor(Math.random() * 3) - 1;

    store.observability.cpuUsagePercent = Math.max(10, Math.min(90, baseCpu + deltaCpu));
    store.observability.memoryUsagePercent = Math.max(20, Math.min(85, baseMemory + deltaMem));
    store.observability.requestRateRps = 1400 + Math.floor(Math.random() * 50);

    return store.observability;
  }
}
