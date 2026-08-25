import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Search,
  Shield,
  User,
  Clock,
  Filter,
  FileSpreadsheet,
  Sliders,
  Settings,
  Calendar,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || log.entityType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'performance':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case 'kpi':
        return <Sliders className="w-4 h-4 text-pink-400" />;
      case 'user':
        return <User className="w-4 h-4 text-indigo-400" />;
      case 'period':
        return <Calendar className="w-4 h-4 text-teal-400" />;
      case 'settings':
      default:
        return <Settings className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Activity className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">System Audit & Activity History Logs</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of data modifications, user management, and KPI weight updates
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit logs by actor, action, or details..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-400 font-semibold">Entity Type:</span>
          {['all', 'performance', 'kpi', 'user', 'period', 'settings'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === t
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor / Performed By</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Modification Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.userName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase">
                        {log.userRole.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-orange-400 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {getEntityIcon(log.entityType)}
                      <span className="capitalize text-slate-300 font-medium">{log.entityType}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-md">
                    <p className="line-clamp-2 leading-relaxed">{log.details}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Activity className="w-10 h-10 mx-auto mb-2 opacity-30 text-orange-400" />
            <p className="text-sm font-semibold">No audit logs found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
