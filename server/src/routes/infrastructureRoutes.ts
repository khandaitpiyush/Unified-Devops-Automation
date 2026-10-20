import { Router, Request, Response } from 'express';
import { InfrastructureService } from '../services/infrastructureService.js';
import { paramStr } from '../utils/params.js';

export const infrastructureRouter = Router();

infrastructureRouter.get('/', (_req: Request, res: Response) => {
  const infra = InfrastructureService.getAll();
  res.json({ data: infra, success: true });
});

infrastructureRouter.post('/:id/plan', (req: Request, res: Response) => {
  try {
    const id = paramStr(req.params.id);
    const plan = InfrastructureService.plan(id);
    res.json({ data: plan, success: true });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});
