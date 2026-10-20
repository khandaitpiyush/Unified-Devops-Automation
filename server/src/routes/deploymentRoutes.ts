import { Router, Request, Response } from 'express';
import { DeploymentService } from '../services/deploymentService.js';
import { paramStr } from '../utils/params.js';

export const deploymentRouter = Router();

deploymentRouter.get('/', (_req: Request, res: Response) => {
  const deployments = DeploymentService.getAll();
  res.json({ data: deployments, success: true });
});

deploymentRouter.patch('/:id/scale', (req: Request, res: Response) => {
  try {
    const id = paramStr(req.params.id);
    const replicas = parseInt(req.body.replicas, 10);
    if (isNaN(replicas) || replicas < 1 || replicas > 20) {
      return res.status(400).json({ success: false, message: 'Invalid replica count (must be between 1 and 20).' });
    }
    const scaled = DeploymentService.scale(id, replicas);
    res.json({ data: scaled, success: true, message: `Deployment scaled to ${replicas} replicas.` });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

deploymentRouter.post('/:id/rollback', (req: Request, res: Response) => {
  try {
    const id = paramStr(req.params.id);
    const rolledBack = DeploymentService.rollback(id);
    res.json({ data: rolledBack, success: true, message: 'Deployment rolled back to previous stable release.' });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});
