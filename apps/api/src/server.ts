import { app } from './app.js';
import { env } from './config/env.js';
import { StorageService } from './services/storage.service.js';
import { runMigrations } from '@lab/db';

async function bootstrap() {
  StorageService.init();

  try {
    console.log('[API Server] Running automatic database migrations check...');
    await runMigrations();
  } catch (err: any) {
    console.warn('[DB Migration Notice]:', err.message);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`[API Server] Running on ${env.PUBLIC_URL} (Port: ${env.PORT})`);
    console.log(`[Environment] ${env.NODE_ENV}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

bootstrap();
