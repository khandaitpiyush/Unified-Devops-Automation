import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

export const authRouter = Router();

authRouter.get('/me', (_req: Request, res: Response) => {
  const user = AuthService.getCurrentUser();
  res.json({ data: user, success: true });
});

authRouter.get('/github/authorize', (_req: Request, res: Response) => {
  const oauth = AuthService.getGitHubOAuthUrl();
  res.json({ data: oauth, success: true });
});

authRouter.get('/github/callback', (req: Request, res: Response) => {
  const code = req.query.code;
  // In production, exchange code for access_token with GitHub OAuth
  res.redirect(`http://localhost:3000/app/repositories?oauth_success=true&code=${code || ''}`);
});
