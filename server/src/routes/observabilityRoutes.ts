import { Router, Request, Response } from 'express';
import { ObservabilityService } from '../services/observabilityService.js';

export const observabilityRouter = Router();

observabilityRouter.get('/metrics', (_req: Request, res: Response) => {
  const metrics = ObservabilityService.getMetrics();
  res.json({ data: metrics, success: true });
});
