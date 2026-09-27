import { app } from './app.js';
import { connectDB, disconnectDB } from './config/database.js';
import { env } from './config/env.js';

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(env.PORT, () => {
      console.log(`====================================================`);
      console.log(`[PTMS Server] Running in ${env.NODE_ENV} mode`);
      console.log(`[PTMS Server] Listening on port: ${env.PORT}`);
      console.log(`[PTMS Server] Health endpoint: http://localhost:${env.PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('[PTMS Server] Fatal startup failure:', error);
    process.exit(1);
  }
};

const handleShutdown = async (signal) => {
  console.log(`\n[PTMS Server] Received ${signal}. Commencing graceful termination...`);
  if (server) {
    server.close(async () => {
      console.log('[PTMS Server] HTTP server closed');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer();
