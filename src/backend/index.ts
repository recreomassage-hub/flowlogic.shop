import express, { Express, Request, Response } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import authRoutes from './api/routes/authRoutes';
import userRoutes from './api/routes/userRoutes';
import subscriptionRoutes from './api/routes/subscriptionRoutes';
import assessmentRoutes from './api/routes/assessmentRoutes';

const app: Express = express();

// CORS middleware (критично для фронтенда)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'https://flowlogic.shop',
    credentials: true, // Для httpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    service: 'Flow Logic API',
    version: '1.0.0',
    status: 'ok',
    endpoints: {
      health: '/health',
      auth: '/v1/auth',
      users: '/v1/users',
      subscriptions: '/v1/subscriptions',
      assessments: '/v1/assessments',
    },
  });
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/subscriptions', subscriptionRoutes);
app.use('/v1/assessments', assessmentRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: any) => {
  // Структурированное логирование для CloudWatch
  const errorLog = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id'] || 'unknown',
  };
  
  console.error(JSON.stringify(errorLog));
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    requestId: errorLog.requestId,
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', message: 'Route not found' });
});

// Export for serverless
export const handler = serverless(app);

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

