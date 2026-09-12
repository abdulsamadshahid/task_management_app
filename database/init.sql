-- ==============================================================================
-- Task Management Application - Database Initialization Script
-- Database: PostgreSQL 15+
-- ==============================================================================

-- Create tasks table with primary key, constraints, and audit timestamps
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes for querying and status filtering
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_tasks_updated_at ON tasks;
CREATE TRIGGER set_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed initial tasks for testing and demonstration (only if table is empty)
INSERT INTO tasks (title, description, status)
SELECT 'Setup Docker containers', 'Configure frontend, backend, and postgres services in docker-compose.yml', 'completed'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE id = 1);

INSERT INTO tasks (title, description, status)
SELECT 'Verify backend REST API', 'Test GET, POST, PUT, and DELETE endpoints on /api/tasks and check /health endpoint', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE id = 2);

INSERT INTO tasks (title, description, status)
SELECT 'Deploy to Kubernetes or Cloud Run', 'Prepare production deployment manifests and configure CI/CD pipeline', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE id = 3);
