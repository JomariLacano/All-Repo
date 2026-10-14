import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { generalApiLimiter } from './middleware/rateLimit.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import publicRoutes from './routes/public.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';

export function createApp(): Application {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(generalApiLimiter);

  app.use('/api', publicRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
