import app from './app';
import { env } from './config/env';
import { getDb } from './db/database';

const bootstrap = async () => {
  await getDb();

  app.listen(env.port, () => {
    // Keep startup output clear for Render and local debugging.
    console.log(`API running on port ${env.port}`);
  });
};

bootstrap().catch((error: unknown) => {
  console.error('Failed to bootstrap application', error);
  process.exit(1);
});
