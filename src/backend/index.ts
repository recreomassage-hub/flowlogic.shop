import express, { Express, Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { logger } from './utils/logger';
import authRoutes from './api/routes/authRoutes';
import userRoutes from './api/routes/userRoutes';
import subscriptionRoutes from './api/routes/subscriptionRoutes';
import assessmentRoutes from './api/routes/assessmentRoutes';
import movementTestsRoutes from './api/routes/movementTestsRoutes';
import exercisesRoutes from './api/routes/exercisesRoutes';

const app: Express = express();

// CORS middleware (критично для фронтенда)
// Поддержка нескольких origins: основной домен + Vercel preview deployments
const allowedOrigins = [
  'https://flowlogic.shop',
  'https://frontend-mu-six-96.vercel.app',
  // Поддержка всех Vercel preview deployments
  /^https:\/\/.*\.vercel\.app$/,
  // Дополнительные origins из переменной окружения (через запятую)
  ...(process.env.ALLOWED_ORIGINS?.split(',').map((o: string) => o.trim()) || []),
  // Основной FRONTEND_URL (если указан)
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
].filter(Boolean);

// Явная обработка OPTIONS запросов перед CORS middleware
// Health endpoint и root endpoint доступны без CORS проверки
app.options('*', (req: Request, res: Response) => {
  // Allow health and root endpoints without CORS check
  if (req.path === '/health' || req.path === '/') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.status(200).end();
    return;
  }

  const origin = req.headers.origin;
  
  // Проверка origin
  if (origin && allowedOrigins.some(allowed => {
    if (typeof allowed === 'string') {
      return allowed === origin;
    }
    if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return false;
  })) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }
  
  // Если origin не разрешен, все равно отвечаем (для безопасности)
  res.status(403).end();
});

// Middleware для health и root endpoints - всегда разрешать доступ (ПЕРЕД CORS)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health' || req.path === '/') {
    // Установить CORS headers для health/root endpoints
    const origin = req.headers.origin;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    // Продолжить обработку запроса (не блокировать CORS middleware)
  }
  next();
});

// CORS middleware с пропуском health и root endpoints
app.use((req: Request, _res: Response, next: NextFunction) => {
  // Пропустить CORS для health и root endpoints
  if (req.path === '/health' || req.path === '/') {
    return next();
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Разрешить запросы без origin (например, Postman, curl, health checks)
      if (!origin) {
        return callback(null, true);
      }
      
      // Проверка точного совпадения
      if (allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return allowed === origin;
        }
        // Проверка регулярного выражения
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      })) {
        // Возвращаем конкретный origin (не '*') для поддержки credentials
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Для httpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false, // Обрабатывать preflight в Express
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (structured logging)
app.use((req: Request, _res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || 
                    req.headers['x-amzn-requestid'] as string || 
                    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Add requestId to request object for use in handlers
  (req as any).requestId = requestId;
  
  // Log request
  logger.request(req, {
    requestId,
    userAgent: req.get('user-agent'),
  });
  
  next();
});

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
      movementTests: '/v1/movement-tests',
      exercises: '/v1/exercises',
    },
  });
});

// Health check with dependency checks
import { healthCheckHandler } from './handlers/health';
app.get('/health', healthCheckHandler);

// Response logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = (req as any).requestId || 'unknown';

  // Override res.end to log response
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const latency = Date.now() - startTime;
    logger.response(req, res.statusCode, latency, {
      requestId,
      contentLength: res.get('content-length'),
    });
    return originalEnd(chunk, encoding, cb);
  };

  next();
});

// API Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/subscriptions', subscriptionRoutes);
app.use('/v1/assessments', assessmentRoutes);
app.use('/v1/movement-tests', movementTestsRoutes);
app.use('/v1/exercises', exercisesRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: any) => {
  const requestId = (req as any).requestId || 'unknown';
  
  logger.error('Unhandled error in request handler', err, {
    requestId,
    path: req.path,
    method: req.method,
    userId: (req as any).userId, // If set by auth middleware
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' || process.env.STAGE === 'dev' 
      ? err.message 
      : 'An error occurred',
    requestId,
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', message: 'Route not found' });
});

// Export for serverless
export const handler = serverless(app, {
  binary: ['application/pdf', 'image/*'],
  request: (request: any, event: any, _context: any) => {
    // Логирование входящего запроса
    // Log incoming Lambda event (debug level)
    logger.debug('Lambda event received', {
      path: event.path,
      method: event.httpMethod,
      requestId: event.requestContext?.requestId,
    });
    console.log('Headers:', JSON.stringify(event.headers, null, 2));
    console.log('Body:', event.body);
    return request;
  },
});

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

