import { Router, Request, Response } from 'express';
import { PipelineService } from '../services/pipelineService.js';
import { paramStr } from '../utils/params.js';

export const pipelineRouter = Router();

pipelineRouter.get('/', (_req: Request, res: Response) => {
  const pipelines = PipelineService.getAll();
  res.json({ data: pipelines, success: true });
});

pipelineRouter.get('/:id', (req: Request, res: Response) => {
  const id = paramStr(req.params.id);
  const pipeline = PipelineService.getById(id);
  if (!pipeline) {
    return res.status(404).json({ success: false, message: 'Pipeline execution not found' });
  }
  res.json({ data: pipeline, success: true });
});

pipelineRouter.post('/:id/abort', (req: Request, res: Response) => {
  const id = paramStr(req.params.id);
  const aborted = PipelineService.abort(id);
  if (!aborted) {
    return res.status(404).json({ success: false, message: 'Pipeline execution not found' });
  }
  res.json({ data: aborted, success: true, message: 'Pipeline build execution aborted.' });
});
