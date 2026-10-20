import { Router, Request, Response } from 'express';
import { PipelineService } from '../services/pipelineService.js';
import { store } from '../store/dataStore.js';

export const webhookRouter = Router();

// POST /api/webhooks/github
webhookRouter.post('/github', (req: Request, res: Response) => {
  const event = req.headers['x-github-event'] || 'push';
  const payload = req.body;

  // Handle push event
  if (event === 'push') {
    const repoFullName = payload?.repository?.full_name;
    const ref = payload?.ref || 'refs/heads/main';
    const branch = ref.replace('refs/heads/', '');

    // Find matching connected repo
    const repo = store.repositories.find(
      (r) => r.fullName.toLowerCase() === (repoFullName || '').toLowerCase()
    ) || store.repositories[0];

    if (repo && branch === repo.defaultBranch) {
      const pipeline = PipelineService.trigger(repo.id, branch, 'github_push');
      return res.status(200).json({
        success: true,
        message: `Webhook accepted. Triggered autonomous pipeline #${pipeline.buildNumber} for ${repo.fullName}`,
        data: { buildNumber: pipeline.buildNumber, pipelineId: pipeline.id },
      });
    }
  }

  return res.status(200).json({
    success: true,
    message: `Webhook received for event "${event}". No automated pipeline action required.`,
  });
});
