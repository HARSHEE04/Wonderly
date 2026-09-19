import { env } from './config/env.js';
import { connectMongo } from './database/mongo.js';
import app from './server.js';

async function startServer() {
  await connectMongo();
  app.listen(env.port, () => {
    console.log(`Prevengers backend running on http://localhost:${env.port}`);
  });
}

startServer();
