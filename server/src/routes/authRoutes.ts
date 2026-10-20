import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

export const authRouter = Router();

authRouter.get('/me', async (_req: Request, res: Response) => {
  try {
    const user = await AuthService.getCurrentUser();
    res.json({ data: user, success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

authRouter.get('/github/authorize', (_req: Request, res: Response) => {
  const oauth = AuthService.getGitHubOAuthUrl();
  res.json({ data: oauth, success: true });
});

authRouter.get('/github/callback', (req: Request, res: Response) => {
  const code = req.query.code;
  res.redirect(`http://localhost:3000/app/repositories?oauth_success=true&code=${code || ''}`);
});
