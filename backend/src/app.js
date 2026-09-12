const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');
const healthRoutes = require('./routes/health');

const app = express();

// Middleware: CORS Configuration
// Allows the React frontend container to interact with the backend API.
// In production, CORS_ORIGIN specifies the exact allowed domain (e.g., http://localhost:3000).
const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions = {
  origin: corsOrigin ? corsOrigin.split(',').map((o) => o.trim()) : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware: JSON body parser
app.use(express.json());

// Lightweight request logger
app.use((req, res, next) => {
  if (req.path !== '/health') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Mount Routes
app.use('/health', healthRoutes);
app.use('/api/tasks', taskRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Task Management Backend REST API',
    status: 'running',
    docs: {
      health: 'GET /health',
      tasks: 'GET /api/tasks',
      singleTask: 'GET /api/tasks/:id',
      createTask: 'POST /api/tasks',
      updateTask: 'PUT /api/tasks/:id',
      deleteTask: 'DELETE /api/tasks/:id',
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`, err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
