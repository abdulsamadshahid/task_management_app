import React, { useState } from 'react';
import { PlusCircle, Loader2, AlertCircle } from 'lucide-react';

export default function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Task title is required.');
      return;
    }

    if (trimmedTitle.length > 255) {
      setFormError('Task title must be 255 characters or fewer.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onTaskCreated({
        title: trimmedTitle,
        description: description.trim() || null,
        status,
      });

      // Reset form on success
      setTitle('');
      setDescription('');
      setStatus('pending');
    } catch (err) {
      setFormError(err.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="task-creation-section" className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <h2 id="task-form-title" className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-blue-600" />
        Create New Task
      </h2>

      {formError && (
        <div id="task-form-error" className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form id="create-task-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="task-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Verify database migration scripts"
            maxLength={255}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors disabled:opacity-50"
            required
          />
        </div>

        <div>
          <label htmlFor="task-desc-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Description <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="task-desc-input"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add relevant context, acceptance criteria, or technical details..."
            disabled={isSubmitting}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors resize-y disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Initial Status:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
              <button
                type="button"
                id="status-pending-btn"
                onClick={() => setStatus('pending')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  status === 'pending'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                id="status-completed-btn"
                onClick={() => setStatus('completed')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  status === 'completed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="submit-task-btn"
            disabled={isSubmitting || !title.trim()}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Task'
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
