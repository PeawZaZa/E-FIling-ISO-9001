import { config } from './config.js';
import { createApp } from './app.js';
import { checkDatabase, disconnectDatabase } from './lib/prisma.js';
const server = createApp(checkDatabase).listen(config.port, '127.0.0.1', () => {
  console.log(`API ready at http://127.0.0.1:${config.port}`);
});
server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(error.code === 'EADDRINUSE' ? 'API port is already in use. Change API_PORT.' : 'API could not start.');
  process.exitCode = 1;
});
function shutdown() {
  const timer = setTimeout(() => process.exit(1), 5000).unref();
  server.close(() => { void disconnectDatabase().finally(() => { clearTimeout(timer); process.exit(0); }); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
