import React from 'react';
import TaskItem from './TaskItem';
import { ClipboardList, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

export default function TaskList({
  tasks,
  loading,
  error,
  currentFilter,
  onRetry,
  onToggleStatus,
  onEdit,
  onDelete,
  togglingId,
  deletingId,
}) {
  // 1. Loading State
  if (loading) {
    return (
      <section id="tasks-loading-state" className="space-y-3 py-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-md bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded-sm w-1/3" />
                <div className="h-3 bg-slate-100 rounded-sm w-3/4" />
                <div className="h-3 bg-slate-100 rounded-sm w-1/4 mt-4" />
              </div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <section id="tasks-error-state" className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-rose-900 mb-1">
          Failed to Load Tasks
        </h3>
        <p className="text-sm text-rose-700 max-w-md mx-auto mb-4">
          {error}
        </p>
        <button
          type="button"
          id="retry-fetch-tasks-btn"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </section>
    );
  }

  // 3. Empty State
  if (!tasks || tasks.length === 0) {
    return (
      <section id="tasks-empty-state" className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <ClipboardList className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          {currentFilter === 'all'
            ? 'No tasks yet'
            : `No ${currentFilter} tasks`}
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          {currentFilter === 'all'
            ? 'Create your first task using the form above to get started.'
            : `You have no tasks marked as ${currentFilter}. Change your filter or create a new task.`}
        </p>
      </section>
    );
  }

  // 4. Task List rendering
  return (
    <section id="tasks-list-container" className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          isToggling={togglingId === task.id}
          isDeleting={deletingId === task.id}
        />
      ))}
    </section>
  );
}
