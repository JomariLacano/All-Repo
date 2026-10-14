import { createApp } from './app';
import { config } from './config';
import { ensureInitialAdmin } from './services/auth.service';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  await ensureInitialAdmin();

  const app = createApp();

  app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`, { clientUrl: config.clientUrl });
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server.', { message: err instanceof Error ? err.message : 'unknown' });
  process.exit(1);
});
