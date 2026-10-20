import { Router, Request, Response } from 'express';
import { IntegrationService } from '../services/integrationService.js';
import { paramStr } from '../utils/params.js';

export const integrationRouter = Router();

integrationRouter.get('/', (_req: Request, res: Response) => {
  const integrations = IntegrationService.getAll();
  res.json({ data: integrations, success: true });
});

integrationRouter.post('/:id/test', (req: Request, res: Response) => {
  try {
    const id = paramStr(req.params.id);
    const result = IntegrationService.test(id);
    res.json({ data: result, success: true });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

integrationRouter.put('/:id', (req: Request, res: Response) => {
  const id = paramStr(req.params.id);
  const updated = IntegrationService.update(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Integration not found' });
  }
  res.json({ data: { success: true }, success: true, message: 'Configuration saved.' });
});
