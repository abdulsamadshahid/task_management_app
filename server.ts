import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { createServer as createViteServer } from 'vite';

const require = createRequire(import.meta.url);
const taskRoutes = require('./backend/src/routes/tasks.js');
const healthRoutes = require('./backend/src/routes/health.js');
const db = require('./backend/src/db.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Initialize database schema or fallback store
  try {
    await db.initDb();
  } catch (err: any) {
    console.error('[Server DB Init Error]:', err.message);
  }

  // Mount Backend API Routes FIRST
  app.use('/health', healthRoutes);
  app.use('/api/tasks', taskRoutes);

  // Vite middleware for development preview
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(` Task Management Full-Stack Applet`);
    console.log(` Running on: http://0.0.0.0:${PORT}`);
    console.log(` Health:     http://0.0.0.0:${PORT}/health`);
    console.log(` Tasks API:  http://0.0.0.0:${PORT}/api/tasks`);
    console.log(`=========================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
