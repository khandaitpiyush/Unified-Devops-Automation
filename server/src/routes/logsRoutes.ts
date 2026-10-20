import { Router, Request, Response } from 'express';

export const logsRouter = Router();

logsRouter.get('/stream', (req: Request, res: Response) => {
  const type = req.query.type || 'cicd';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendLog = (level: string, message: string) => {
    const data = JSON.stringify({
      time: new Date().toLocaleTimeString(),
      level,
      text: message,
      type,
    });
    res.write(`data: ${data}\n\n`);
  };

  sendLog('INFO', `Live streaming connection established for log channel: ${type}`);

  let step = 1;
  const interval = setInterval(() => {
    if (step === 1) sendLog('INFO', 'Pipeline runner heartbeat: OK. Agent load: 0.24');
    else if (step === 2) sendLog('INFO', 'Kubernetes pod probes: Liveness HTTP 200 OK');
    else if (step === 3) sendLog('WARN', 'Network I/O jitter spike observed on node aks-pool-1 (recovered)');
    else if (step === 4) sendLog('INFO', 'Security policy guard: 0 critical vulnerabilities active.');
    else if (step === 5) sendLog('INFO', 'Prometheus telemetry scrape cycle completed (1,420 rps)');
    step = (step % 5) + 1;
  }, 4000);

  req.on('close', () => {
    clearInterval(interval);
  });
});
