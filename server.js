import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import connectDB from './backend/config/db.js';
import apiRoutes from './backend/routes/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Connect to MongoDB (with automatic memory fallback if no URI provided)
  await connectDB();

  // Backend REST API routes
  app.use('/api', apiRoutes);

  // Vite integration for Frontend
  const frontendPath = path.resolve(__dirname, 'frontend');

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: frontendPath,
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist/frontend');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MERN Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error]', err);
});
