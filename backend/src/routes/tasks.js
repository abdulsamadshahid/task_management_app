const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /api/tasks
 * Retrieve all tasks, optionally filtered by ?status=pending|completed
 */
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    if (status && status !== 'pending' && status !== 'completed') {
      return res.status(400).json({
        error: 'Invalid status filter. Allowed values: pending, completed.',
      });
    }

    const tasks = await db.getTasks(status);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/tasks/:id
 * Retrieve a single task by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Task ID must be a valid number.' });
    }

    const task = await db.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: `Task with ID ${id} not found.` });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/tasks
 * Create a new task.
 * Body: { title: string (required), description?: string, status?: 'pending' | 'completed' }
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Field "title" is required and must be a non-empty string.',
      });
    }

    if (title.trim().length > 255) {
      return res.status(400).json({
        error: 'Field "title" must not exceed 255 characters.',
      });
    }

    if (status !== undefined && status !== 'pending' && status !== 'completed') {
      return res.status(400).json({
        error: 'Field "status" must be either "pending" or "completed".',
      });
    }

    const newTask = await db.createTask({
      title: title.trim(),
      description: description ? String(description).trim() : null,
      status: status || 'pending',
    });

    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/tasks/:id
 * Update an existing task.
 * Body can contain: title, description, status
 */
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Task ID must be a valid number.' });
    }

    const { title, description, status } = req.body;

    // Check at least one field provided
    if (title === undefined && description === undefined && status === undefined) {
      return res.status(400).json({
        error: 'At least one field (title, description, or status) must be provided for update.',
      });
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          error: 'Field "title" cannot be empty.',
        });
      }
      if (title.trim().length > 255) {
        return res.status(400).json({
          error: 'Field "title" must not exceed 255 characters.',
        });
      }
    }

    if (status !== undefined && status !== 'pending' && status !== 'completed') {
      return res.status(400).json({
        error: 'Field "status" must be either "pending" or "completed".',
      });
    }

    const updatedTask = await db.updateTask(id, {
      title,
      description,
      status,
    });

    if (!updatedTask) {
      return res.status(404).json({ error: `Task with ID ${id} not found.` });
    }

    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete an existing task
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Task ID must be a valid number.' });
    }

    const deleted = await db.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ error: `Task with ID ${id} not found.` });
    }

    res.json({ message: 'Task deleted successfully.', id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
