require('dotenv').config();
const app = require('./app');
const db = require('./db');

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0';

async function startServer() {
  // Ensure database connection and tables exist before handling incoming traffic
  await db.initDb();

  const server = app.listen(PORT, HOST, () => {
    console.log(`=========================================`);
    console.log(` Task Management Backend API`);
    console.log(` Status: Running`);
    console.log(` Listening on: http://${HOST}:${PORT}`);
    console.log(` Health Check: http://${HOST}:${PORT}/health`);
    console.log(` Tasks API:   http://${HOST}:${PORT}/api/tasks`);
    console.log(`=========================================`);
  });

  // Graceful shutdown handling for container stops
  const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Gracefully shutting down HTTP server...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });

    // Force shutdown if taking longer than 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
