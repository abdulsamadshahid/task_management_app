import React from 'react';
import { ListFilter } from 'lucide-react';

export default function FilterBar({ currentFilter, onFilterChange, counts }) {
  const filters = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div id="filter-bar" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <ListFilter className="w-4 h-4 text-slate-400" />
        Filter Tasks:
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {filters.map(({ key, label, count }) => {
          const isActive = currentFilter === key;
          return (
            <button
              key={key}
              id={`filter-btn-${key}`}
              onClick={() => onFilterChange(key)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
                  isActive ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
