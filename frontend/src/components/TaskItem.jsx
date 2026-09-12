import React from 'react';
import { Check, Undo2, Edit2, Trash2, Calendar, Clock } from 'lucide-react';

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(isoString);
  }
}

export default function TaskItem({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  isToggling,
  isDeleting,
}) {
  const isCompleted = task.status === 'completed';

  return (
    <article
      id={`task-card-${task.id}`}
      className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
        isCompleted
          ? 'border-slate-200 bg-slate-50/60'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Status Toggle Checkbox/Button */}
          <button
            type="button"
            id={`toggle-task-${task.id}`}
            onClick={() => onToggleStatus(task)}
            disabled={isToggling}
            aria-label={isCompleted ? 'Mark task as pending' : 'Mark task as completed'}
            className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 bg-white hover:border-blue-500 text-transparent hover:text-slate-300'
            } disabled:opacity-50`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Title & Description */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3
                id={`task-title-${task.id}`}
                className={`text-base font-semibold leading-snug break-words ${
                  isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                }`}
              >
                {task.title}
              </h3>
              <span
                id={`task-status-badge-${task.id}`}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {task.status}
              </span>
            </div>

            {task.description ? (
              <p
                id={`task-desc-${task.id}`}
                className={`text-sm mt-1 leading-relaxed whitespace-pre-wrap break-words ${
                  isCompleted ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {task.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic mt-1">No description provided</p>
            )}

            {/* Timestamps */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5" title="Creation Date">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Created: {formatDate(task.created_at)}</span>
              </span>
              <span className="flex items-center gap-1.5" title="Last Updated Date">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Updated: {formatDate(task.updated_at)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            type="button"
            id={`edit-task-btn-${task.id}`}
            onClick={() => onEdit(task)}
            title="Edit task"
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            id={`delete-task-btn-${task.id}`}
            onClick={() => onDelete(task.id)}
            disabled={isDeleting}
            title="Delete task"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
