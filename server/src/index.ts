import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { RepositoryService } from './services/repositoryService.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Root Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Unified DevOps Automation API Engine',
    version: '1.0.0',
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Unified DevOps Automation API Engine',
    version: '1.0.0',
  });
});

// Mount /api Router
app.use('/api', apiRouter);

// 404 Handler for unhandled API routes
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: config.nodeEnv === 'development' ? err.stack : undefined,
  });
});

// Start Server
const server = app.listen(config.port, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 Unified DevOps Automation API Server Running!`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`🔌 API Base: http://localhost:${config.port}/api`);
  console.log(`🩺 Health: http://localhost:${config.port}/health`);
  console.log(`⚡ Mode: ${config.nodeEnv}`);
  console.log(`=======================================================`);

  // Pre-load and sync repositories from GitHub API on server boot
  try {
    const repos = await RepositoryService.getAll();
    console.log(`📦 Loaded ${repos.length} live repositories from GitHub API.`);
  } catch (err: any) {
    console.warn('Initial GitHub repository sync skipped:', err.message);
  }
});

// Graceful Shutdown
const shutdown = () => {
  console.log('\nGracefully shutting down DevOps API server...');
  server.close(() => {
    console.log('Server closed. Process exiting.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app;
