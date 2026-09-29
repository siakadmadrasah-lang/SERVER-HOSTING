import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  RotateCw, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Terminal
} from 'lucide-react';
import { SystemLog, Language } from '../types';

interface LogsViewProps {
  logs: SystemLog[];
  onRefreshLogs: () => void;
  currentLang: Language;
}

export const LogsView: React.FC<LogsViewProps> = ({
  logs,
  onRefreshLogs,
  currentLang
}) => {
  const [filterService, setFilterService] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    const matchesService = filterService === 'all' || log.service === filterService;
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesService && matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Audit Trail</span>
            <span aria-hidden="true">/</span>
            <span className="text-indigo-400">Log Aktivitas Server & Cluster DB</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Log Sistem & Pemantauan Peristiwa
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming log waktu nyata dari Nginx, MySQL Cluster, PHP-FPM, Certbot, dan automasi installer.
          </p>
        </div>

        <button
          onClick={onRefreshLogs}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Muat Ulang Log</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="all">Semua Servis</option>
            <option value="nginx">Nginx Web Server</option>
            <option value="mysql-cluster">MySQL Centralized Cluster</option>
            <option value="php-fpm">PHP-FPM Process Pool</option>
            <option value="certbot">Certbot SSL</option>
            <option value="installer">Automated Installer</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Level</option>
            <option value="info">INFO</option>
            <option value="success">SUCCESS</option>
            <option value="warn">WARNING</option>
            <option value="error">ERROR</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari dalam pesan log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl font-mono text-xs divide-y divide-slate-900">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-300">Journalctl & Event Stream</span>
          </div>
          <span className="text-[11px] tabular-nums">{filteredLogs.length} entri tercatat</span>
        </div>

        <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
          {filteredLogs.map((log) => {
            return (
              <div 
                key={log.id} 
                className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 hover:bg-slate-900 transition-colors"
              >
                <div className="pt-0.5 shrink-0">
                  {log.level === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  ) : log.level === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Info className="w-4 h-4 text-indigo-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-indigo-400 font-semibold uppercase">{log.service}</span>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <span className="text-slate-500 tabular-nums">{log.timestamp}</span>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                      log.level === 'error' ? 'text-rose-400 bg-rose-500/10' :
                      log.level === 'success' ? 'text-emerald-400 bg-emerald-500/10' :
                      'text-indigo-300 bg-indigo-500/10'
                    }`}>
                      {log.level}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed break-all">
                    {log.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
