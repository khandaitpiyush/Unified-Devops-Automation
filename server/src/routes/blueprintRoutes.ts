import { Router, Request, Response } from 'express';
import { BlueprintService } from '../services/blueprintService.js';
import { ArtifactService } from '../services/artifactService.js';
import { paramStr } from '../utils/params.js';

export const blueprintRouter = Router();

// GET all blueprints
blueprintRouter.get('/', (_req: Request, res: Response) => {
  const blueprints = BlueprintService.getAll();
  res.json({ data: blueprints, success: true });
});

// GET blueprint by ID
blueprintRouter.get('/:id', (req: Request, res: Response) => {
  const id = paramStr(req.params.id);
  const bp = BlueprintService.getById(id);
  if (!bp) {
    return res.status(404).json({ success: false, message: 'Blueprint not found' });
  }
  res.json({ data: bp, success: true });
});

// POST create blueprint
blueprintRouter.post('/', (req: Request, res: Response) => {
  try {
    const bp = BlueprintService.create(req.body);
    res.status(201).json({ data: bp, success: true, message: 'Blueprint created.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST approve blueprint
blueprintRouter.post('/:id/approve', (req: Request, res: Response) => {
  try {
    const id = paramStr(req.params.id);
    const approvedBy = req.body.approvedBy || 'Piyush Khandait';
    const bp = BlueprintService.approve(id, approvedBy);
    res.json({ data: bp, success: true, message: 'Blueprint approved. Artifacts generated.' });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST regenerate artifacts from blueprint
blueprintRouter.post('/:id/generate-artifacts', (req: Request, res: Response) => {
  try {
    const id = paramStr(req.params.id);
    const artifacts = ArtifactService.regenerate(id);
    res.json({ data: artifacts, success: true, message: 'Artifacts generated.' });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});
