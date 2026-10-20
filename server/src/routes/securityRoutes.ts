import { Router, Request, Response } from 'express';
import { SecurityService } from '../services/securityService.js';
import { paramStr } from '../utils/params.js';

export const securityRouter = Router();

// GET all security records
securityRouter.get('/', (_req: Request, res: Response) => {
  const data = SecurityService.getAll();
  res.json({ data, success: true });
});

// GET overview
securityRouter.get('/overview', (_req: Request, res: Response) => {
  const overview = SecurityService.getOverview();
  res.json({ data: overview, success: true });
});

// POST global scan
securityRouter.post('/scan', (_req: Request, res: Response) => {
  const scanned = SecurityService.runScan();
  res.json({ data: scanned, success: true, message: 'Trivy and SonarQube scan completed.' });
});

// GET security for specific repository
securityRouter.get('/:repoId', (req: Request, res: Response) => {
  const repoId = paramStr(req.params.repoId);
  const overview = SecurityService.getOverview(repoId);
  res.json({ data: overview, success: true });
});

// POST scan for specific repository
securityRouter.post('/:repoId/scan', (req: Request, res: Response) => {
  const repoId = paramStr(req.params.repoId);
  const scanned = SecurityService.runScan(repoId);
  res.json({ data: scanned, success: true, message: `Security scan completed for ${repoId}.` });
});
