import { createApp } from './src/server/app';
import { config } from './src/config';

async function startServer() {
  const app = await createApp();
  const PORT = config.port;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PBMS Production Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start PBMS Express Server:', err);
  process.exit(1);
});
