const { Pool } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'taskdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
};

let pool = null;
let isPgConnected = false;

// Resilient in-memory fallback store if PostgreSQL is temporarily unavailable in preview
let memoryTasks = [
  {
    id: 1,
    title: 'Setup Docker containers',
    description: 'Configure frontend, backend, and postgres services in docker-compose.yml',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    title: 'Verify backend REST API',
    description: 'Test GET, POST, PUT, and DELETE endpoints on /api/tasks and check /health endpoint',
    status: 'pending',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 3,
    title: 'Deploy to Kubernetes or Cloud Run',
    description: 'Prepare production deployment manifests and configure CI/CD pipeline',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
let nextMemoryId = 4;

/**
 * Initialize database connection and ensure tasks table exists.
 */
async function initDb() {
  try {
    pool = new Pool(dbConfig);
    pool.on('error', (err) => {
      console.error('[Database Pool Error]:', err.message);
    });

    const client = await pool.connect();
    try {
      const tableQuery = `
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
        CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
      `;
      await client.query(tableQuery);

      // Check if table is empty, insert initial seed tasks if so
      const countRes = await client.query('SELECT COUNT(*) FROM tasks');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO tasks (title, description, status) VALUES
          ('Setup Docker containers', 'Configure frontend, backend, and postgres services in docker-compose.yml', 'completed'),
          ('Verify backend REST API', 'Test GET, POST, PUT, and DELETE endpoints on /api/tasks and check /health endpoint', 'pending'),
          ('Deploy to Kubernetes or Cloud Run', 'Prepare production deployment manifests and configure CI/CD pipeline', 'pending');
        `);
      }

      isPgConnected = true;
      console.log(`[Database] Successfully connected to PostgreSQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    } finally {
      client.release();
    }
  } catch (err) {
    isPgConnected = false;
    console.warn(`[Database] Notice: PostgreSQL is not reachable (${err.message}). Using local in-memory task store.`);
  }
}

/**
 * Health check querying the database
 */
async function checkDbHealth() {
  if (!pool || !isPgConnected) {
    // Attempt quick reconnect if possible
    try {
      if (!pool) {
        pool = new Pool(dbConfig);
      }
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      isPgConnected = true;
      return { connected: true, type: 'postgresql', host: dbConfig.host, database: dbConfig.database };
    } catch (err) {
      return { connected: false, type: 'in-memory-fallback', message: 'PostgreSQL connection failed', error: err.message };
    }
  }

  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    const duration = Date.now() - start;
    return { connected: true, type: 'postgresql', host: dbConfig.host, database: dbConfig.database, latencyMs: duration };
  } catch (err) {
    isPgConnected = false;
    return { connected: false, type: 'in-memory-fallback', message: 'PostgreSQL ping failed', error: err.message };
  }
}

/**
 * Get all tasks, with optional status filter ('pending' | 'completed')
 */
async function getTasks(statusFilter) {
  if (isPgConnected && pool) {
    let queryText = 'SELECT id, title, description, status, created_at, updated_at FROM tasks';
    const params = [];

    if (statusFilter && (statusFilter === 'pending' || statusFilter === 'completed')) {
      queryText += ' WHERE status = $1';
      params.push(statusFilter);
    }

    queryText += ' ORDER BY created_at DESC';
    const result = await pool.query(queryText, params);
    return result.rows;
  }

  // Memory fallback
  let list = [...memoryTasks];
  if (statusFilter && (statusFilter === 'pending' || statusFilter === 'completed')) {
    list = list.filter((t) => t.status === statusFilter);
  }
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Get a single task by ID
 */
async function getTaskById(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return null;

  if (isPgConnected && pool) {
    const result = await pool.query(
      'SELECT id, title, description, status, created_at, updated_at FROM tasks WHERE id = $1',
      [numericId]
    );
    return result.rows[0] || null;
  }

  return memoryTasks.find((t) => t.id === numericId) || null;
}

/**
 * Create a new task
 */
async function createTask({ title, description, status = 'pending' }) {
  const finalStatus = status === 'completed' ? 'completed' : 'pending';
  const finalDescription = description ? description.trim() : null;

  if (isPgConnected && pool) {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, status, created_at, updated_at`,
      [title.trim(), finalDescription, finalStatus]
    );
    return result.rows[0];
  }

  const now = new Date().toISOString();
  const newTask = {
    id: nextMemoryId++,
    title: title.trim(),
    description: finalDescription,
    status: finalStatus,
    created_at: now,
    updated_at: now,
  };
  memoryTasks.unshift(newTask);
  return newTask;
}

/**
 * Update an existing task
 */
async function updateTask(id, fields) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return null;

  if (isPgConnected && pool) {
    const setClauses = [];
    const values = [];
    let idx = 1;

    if (fields.title !== undefined) {
      setClauses.push(`title = $${idx++}`);
      values.push(fields.title.trim());
    }
    if (fields.description !== undefined) {
      setClauses.push(`description = $${idx++}`);
      values.push(fields.description ? fields.description.trim() : null);
    }
    if (fields.status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      values.push(fields.status);
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(numericId);

    const queryText = `
      UPDATE tasks
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING id, title, description, status, created_at, updated_at
    `;

    const result = await pool.query(queryText, values);
    return result.rows[0] || null;
  }

  const taskIndex = memoryTasks.findIndex((t) => t.id === numericId);
  if (taskIndex === -1) return null;

  const existing = memoryTasks[taskIndex];
  const updated = {
    ...existing,
    title: fields.title !== undefined ? fields.title.trim() : existing.title,
    description: fields.description !== undefined ? (fields.description ? fields.description.trim() : null) : existing.description,
    status: fields.status !== undefined ? fields.status : existing.status,
    updated_at: new Date().toISOString(),
  };

  memoryTasks[taskIndex] = updated;
  return updated;
}

/**
 * Delete a task by ID
 */
async function deleteTask(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return false;

  if (isPgConnected && pool) {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [numericId]);
    return result.rowCount > 0;
  }

  const initialLength = memoryTasks.length;
  memoryTasks = memoryTasks.filter((t) => t.id !== numericId);
  return memoryTasks.length < initialLength;
}

module.exports = {
  initDb,
  checkDbHealth,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
