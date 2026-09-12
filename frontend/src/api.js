/**
 * API client module for communicating with the Task Management backend REST API.
 * Configured using the VITE_API_URL environment variable.
 */

// If VITE_API_URL is defined, use it without trailing slash.
// Otherwise, fall back to empty string for same-origin proxying.
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Helper to handle fetch responses and extract helpful error messages
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Parse JSON body if present
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    if (!response.ok) {
      const errorMessage =
        (data && (data.error || data.message)) ||
        `HTTP Error ${response.status}: ${response.statusText}`;
      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error(
        `Unable to reach backend service at ${API_BASE_URL || 'current host'}. Please verify backend container is running.`
      );
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

/**
 * Fetch all tasks, optionally filtered by status ('all' | 'pending' | 'completed')
 */
export async function fetchTasks(status = 'all') {
  let endpoint = '/api/tasks';
  if (status && status !== 'all') {
    endpoint += `?status=${encodeURIComponent(status)}`;
  }
  return request(endpoint, { method: 'GET' });
}

/**
 * Fetch a single task by ID
 */
export async function fetchTaskById(id) {
  return request(`/api/tasks/${id}`, { method: 'GET' });
}

/**
 * Create a new task
 */
export async function createTask(taskData) {
  return request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

/**
 * Update an existing task
 */
export async function updateTask(id, fields) {
  return request(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(fields),
  });
}

/**
 * Delete a task by ID
 */
export async function deleteTask(id) {
  return request(`/api/tasks/${id}`, { method: 'DELETE' });
}

/**
 * Check backend and database health status
 */
export async function checkBackendHealth() {
  return request('/health', { method: 'GET' });
}

export { API_BASE_URL };
