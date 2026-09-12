import React from 'react';
import { CheckSquare, Activity, Database, Server } from 'lucide-react';

export default function Header({ health, healthLoading, onRefreshHealth }) {
  const isHealthy = health && health.status === 'healthy';
  const isDegraded = health && health.status === 'degraded';
  const isOffline = !health && !healthLoading;

  return (
    <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 id="app-title" className="text-xl font-bold text-slate-900 tracking-tight">
                Task Management
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                3-Tier Architecture · React · Express · PostgreSQL
              </p>
            </div>
          </div>

          {/* System Health Status Indicator */}
          <div id="system-health-indicator" className="flex items-center space-x-2 text-xs">
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-full font-medium transition-colors ${
                isHealthy
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isDegraded
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : isOffline
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
              title={
                health
                  ? `Backend: Online · DB: ${health.database?.type || 'unknown'} (${health.database?.connected ? 'connected' : 'disconnected'})`
                  : 'Backend unreachable'
              }
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  isHealthy
                    ? 'bg-emerald-500 animate-pulse'
                    : isDegraded
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
              <span className="font-semibold">
                {isHealthy ? 'System Healthy' : isDegraded ? 'DB Degraded' : healthLoading ? 'Checking...' : 'API Offline'}
              </span>
            </div>

            <button
              id="refresh-health-btn"
              onClick={onRefreshHealth}
              disabled={healthLoading}
              title="Refresh health status"
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Activity className={`w-4 h-4 ${healthLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
