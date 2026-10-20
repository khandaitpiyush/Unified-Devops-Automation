import { Router, Request, Response } from 'express';
import { SettingsService } from '../services/settingsService.js';

export const settingsRouter = Router();

settingsRouter.get('/', (_req: Request, res: Response) => {
  const settings = SettingsService.get();
  res.json({ data: settings, success: true });
});

settingsRouter.put('/', (req: Request, res: Response) => {
  const updated = SettingsService.update(req.body);
  res.json({ data: updated, success: true, message: 'Platform settings updated.' });
});
