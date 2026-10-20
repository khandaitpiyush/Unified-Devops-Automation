import { Router, Request, Response } from 'express';
import { ArtifactService } from '../services/artifactService.js';

export const artifactRouter = Router();

artifactRouter.get('/', (_req: Request, res: Response) => {
  const artifacts = ArtifactService.getAll();
  res.json({ data: artifacts, success: true });
});
