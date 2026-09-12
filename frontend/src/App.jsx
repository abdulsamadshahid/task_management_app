import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import EditTaskModal from './components/EditTaskModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { AlertCircle, X } from 'lucide-react';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  checkBackendHealth,
} from './api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('all');

  // Backend & database health state
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Modal states
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Action loading indicators
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch health check
  const refreshHealth = useCallback(async () => {
    try {
      setHealthLoading(true);
      const data = await checkBackendHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // Fetch tasks based on active filter
  const loadTasks = useCallback(async (filterToUse = currentFilter) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTasks(filterToUse);
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Unable to connect to backend REST API.');
    } finally {
      setLoading(false);
    }
  }, [currentFilter]);

  // Initial load
  useEffect(() => {
    loadTasks(currentFilter);
    refreshHealth();
  }, [currentFilter, loadTasks, refreshHealth]);

  // Handler: Create new task
  const handleCreateTask = async (taskData) => {
    const created = await createTask(taskData);
    // If created task matches current filter, add it or reload
    if (currentFilter === 'all' || currentFilter === created.status) {
      setTasks((prev) => [created, ...prev]);
    }
    // Update health status
    refreshHealth();
    return created;
  };

  // Handler: Toggle complete/pending status
  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      setTogglingId(task.id);
      const updated = await updateTask(task.id, { status: nextStatus });

      if (currentFilter === 'all') {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      } else {
        // If filter is specific ('pending' or 'completed'), remove item from current view
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
      }
    } catch (err) {
      setActionError(`Failed to update task status: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  // Handler: Open edit modal
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  // Handler: Save edits
  const handleSaveEdit = async (id, fields) => {
    const updated = await updateTask(id, fields);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  // Handler: Initiate delete (opens in-app confirmation modal)
  const handleRequestDelete = (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      setTaskToDelete(target);
      setIsDeleteModalOpen(true);
    }
  };

  // Handler: Confirm delete action
  const handleConfirmDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      setActionError(`Failed to delete task: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate counts
  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        health={health}
        healthLoading={healthLoading}
        onRefreshHealth={refreshHealth}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* In-app action error banner if any operation fails */}
        {actionError && (
          <div
            id="action-error-banner"
            className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-sm text-rose-800 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="p-1 text-rose-500 hover:text-rose-800 rounded-md hover:bg-rose-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Task Creation Form */}
        <TaskForm onTaskCreated={handleCreateTask} />

        {/* Filter Navigation Bar */}
        <FilterBar
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          counts={counts}
        />

        {/* Task List / Loading / Error / Empty States */}
        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          currentFilter={currentFilter}
          onRetry={() => loadTasks(currentFilter)}
          onToggleStatus={handleToggleStatus}
          onEdit={handleOpenEdit}
          onDelete={handleRequestDelete}
          togglingId={togglingId}
          deletingId={deletingId}
        />
      </main>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        task={taskToDelete}
        isDeleting={Boolean(deletingId)}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <footer className="border-t border-slate-200 bg-white py-4 mt-auto text-center text-xs text-slate-500">
        Task Management DevOps Project · 3-Tier Container Architecture (Frontend :3000 · Backend :5000 · Postgres :5432)
      </footer>
    </div>
  );
}
