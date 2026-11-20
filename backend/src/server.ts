// ⚠️  env.ts MUST be the very first import — it loads dotenv before any
// other module can read process.env.
import { env } from './config/env';

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import conversationRoutes from './routes/conversationRoutes';
import chatRoutes from './routes/chatRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Connect to MongoDB (exits on failure)
connectDB().then(() => {
  // Middleware
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/chat', chatRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  app.listen(Number(env.PORT), () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
});

export default app;
