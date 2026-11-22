import { app } from './app.js';
import { env } from './config/env.js';
import { StorageService } from './services/storage.service.js';

StorageService.init();

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
