import { Router, Request, Response } from 'express';
import { RepositoryService } from '../services/repositoryService.js';
import { AnalysisService } from '../services/analysisService.js';
import { BlueprintService } from '../services/blueprintService.js';
import { ArtifactService } from '../services/artifactService.js';
import { DeploymentService } from '../services/deploymentService.js';
import { PipelineService } from '../services/pipelineService.js';
import { paramStr } from '../utils/params.js';

export const repositoryRouter = Router();

// GET all repositories
repositoryRouter.get('/', (_req: Request, res: Response) => {
  const repos = RepositoryService.getAll();
  res.json({ data: repos, success: true });
});

// POST connect repository
repositoryRouter.post('/connect', (req: Request, res: Response) => {
  try {
    const repo = RepositoryService.connect(req.body);
    res.status(201).json({ data: repo, success: true, message: 'Repository connected and analyzed.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET repository by ID
repositoryRouter.get('/:id', (req: Request, res: Response) => {
  const id = paramStr(req.params.id);
  const repo = RepositoryService.getById(id);
  if (!repo) {
    return res.status(404).json({ success: false, message: 'Repository not found' });
  }
  res.json({ data: repo, success: true });
});

// DELETE repository
repositoryRouter.delete('/:id', (req: Request, res: Response) => {
  const id = paramStr(req.params.id);
  const deleted = RepositoryService.delete(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Repository not found' });
  }
  res.json({ success: true, message: 'Repository disconnected' });
});

// GET repository analysis
repositoryRouter.get('/:id/analysis', (req: Request, res: Response) => {
  const id = paramStr(req.params.id);
  const analysis = AnalysisService.getByRepoId(id);
  res.json({ data: analysis, success: true });
});

// POST trigger repository analysis
repositoryRouter.post('/:id/analyze', (req: Request, res: Response) => {
  try {
    const id = paramStr(req.params.id);
    const analysis = AnalysisService.runAnalysis(id);
    res.json({ data: analysis, success: true, message: 'Analysis completed successfully.' });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// GET blueprints for repository
repositoryRouter.get('/:id/blueprints', (req: Request, res: Response) => {
  const id = paramStr(req.params.id);
  const blueprints = BlueprintService.getByRepoId(id);
  res.json({ data: blueprints, success: true });
});

// GET artifacts for repository
repositoryRouter.get('/:id/artifacts', (req: Request, res: Response) => {
  const id = paramStr(req.params.id);
  const artifacts = ArtifactService.getByRepoId(id);
  res.json({ data: artifacts, success: true });
});

// GET deployments for repository
repositoryRouter.get('/:id/deployments', (req: Request, res: Response) => {
  const id = paramStr(req.params.id);
  const deployments = DeploymentService.getByRepoId(id);
  res.json({ data: deployments, success: true });
});

// POST trigger pipeline for repository
repositoryRouter.post('/:id/pipeline/trigger', (req: Request, res: Response) => {
  try {
    const id = paramStr(req.params.id);
    const branch = req.body.branch || 'main';
    const pipeline = PipelineService.trigger(id, branch, 'manual');
    res.status(201).json({ data: pipeline, success: true, message: `Pipeline #${pipeline.buildNumber} queued.` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});
