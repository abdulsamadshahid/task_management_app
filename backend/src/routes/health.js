const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /health
 * System health check endpoint for container orchestrators (Docker, Kubernetes)
 * Returns HTTP 200 when backend is alive, with database connection details.
 */
router.get('/', async (req, res) => {
  const dbHealth = await db.checkDbHealth();

  const isHealthy = true; // Backend process is running and responding

  const responseData = {
    status: dbHealth.connected ? 'healthy' : 'degraded',
    service: 'task-management-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbHealth,
    environment: process.env.NODE_ENV || 'development',
  };

  // 200 returned because backend API is operational. If database is disconnected,
  // response marks status: 'degraded' and details the DB error.
  res.status(200).json(responseData);
});

module.exports = router;
