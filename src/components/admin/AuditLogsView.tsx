import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Search,
  User,
  Clock,
  Filter,
  FileSpreadsheet,
  Sliders,
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  X,
  Copy,
  Check,
  ShieldAlert,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AuditLog } from '../../types';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Summary counts
  const counts = useMemo(() => {
    const total = auditLogs.length;
    const performance = auditLogs.filter((l) => l.entityType === 'performance').length;
    const user = auditLogs.filter((l) => l.entityType === 'user').length;
    const kpi = auditLogs.filter((l) => l.entityType === 'kpi').length;
    const period = auditLogs.filter((l) => l.entityType === 'period').length;
    const settings = auditLogs.filter((l) => l.entityType === 'settings').length;
    return { total, performance, user, kpi, period, settings };
  }, [auditLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (log.userName && log.userName.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.userId && log.userId.toLowerCase().includes(q)) ||
        (log.entityId && log.entityId.toLowerCase().includes(q));

      const matchesType = typeFilter === 'all' || log.entityType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [auditLogs, search, typeFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'performance':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'kpi':
        return <Sliders className="w-4 h-4 text-pink-600" />;
      case 'user':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'period':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      case 'settings':
      default:
        return <Settings className="w-4 h-4 text-amber-600" />;
    }
  };

  const getActionBadgeClass = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('delete') || act.includes('remove') || act.includes('reject')) {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    if (act.includes('create') || act.includes('add') || act.includes('approve')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (act.includes('lock')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (act.includes('unlock')) {
      return 'bg-teal-50 text-teal-800 border-teal-200';
    }
    return 'bg-blue-50 text-blue-800 border-blue-200';
  };

  const formatTimestamp = (ts: string) => {
    if (!ts) return 'N/A';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return {
        date: d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        time: d.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    } catch {
      return { date: ts, time: '' };
    }
  };

  const handleCopyDetails = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#e2ebd9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#8cc540]/15 text-[#436320] border border-[#8cc540]/30 shadow-xs">
              <Activity className="w-5 h-5 text-[#598327]" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#101010] tracking-tight">
              System Audit & Activity Logs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f0f4ec] text-[#436320] border border-[#8cc540]/40">
              Compliance Trail
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#666666] mt-1.5">
            Immutable audit record of user management, performance updates, period locks, and KPI configurations
          </p>
        </div>
      </div>

      {/* Summary Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-[#e2ebd9] shadow-sm">
          <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block">
            Total Logged Events
          </span>
          <span className="text-2xl font-black text-[#101010] mt-1 block">
            {counts.total}
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#e2ebd9] shadow-sm">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Submissions & Data
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {counts.performance}
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#e2ebd9] shadow-sm">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
            Users & Approvals
          </span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">
            {counts.user}
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#e2ebd9] shadow-sm">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            KPIs, Periods & Config
          </span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {counts.kpi + counts.period + counts.settings}
          </span>
        </div>
      </div>

      {/* Search and Entity Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e2ebd9] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by actor, action, details, ID..."
              className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-[#101010] placeholder:text-[#888888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#101010]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2 self-end md:self-auto text-xs text-[#666666]">
            <span className="font-bold">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#f8faf6] border border-[#e2ebd9] text-xs font-bold text-[#101010] rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer"
            >
              <option value={10}>10 per page</option>
              <option value={15}>15 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Entity Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-[#edf3e7]">
          <span className="text-xs font-bold text-[#555555] whitespace-nowrap mr-1">
            Entity Type:
          </span>
          {[
            { id: 'all', label: 'All Events', count: counts.total },
            { id: 'performance', label: 'Submissions', count: counts.performance },
            { id: 'user', label: 'Users', count: counts.user },
            { id: 'period', label: 'Periods', count: counts.period },
            { id: 'kpi', label: 'KPIs', count: counts.kpi },
            { id: 'settings', label: 'Settings', count: counts.settings },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTypeFilter(t.id);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                typeFilter === t.id
                  ? 'bg-[#8cc540] text-[#101010] font-black shadow-xs'
                  : 'bg-[#f8faf6] text-[#666666] hover:bg-[#edf3e7] hover:text-[#101010] border border-[#e2ebd9]'
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  typeFilter === t.id
                    ? 'bg-black/15 text-[#101010]'
                    : 'bg-[#e2ebd9] text-[#555555]'
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl border border-[#e2ebd9] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2ebd9] bg-[#f8faf6] text-[11px] font-black text-[#555555] uppercase tracking-wider">
                <th className="py-4 px-5">Timestamp</th>
                <th className="py-4 px-4">Actor / Performed By</th>
                <th className="py-4 px-4">Action</th>
                <th className="py-4 px-4">Entity</th>
                <th className="py-4 px-5">Modification Details</th>
                <th className="py-4 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3e7] text-xs">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#888888]">
                    <Activity className="w-10 h-10 mx-auto mb-2 text-[#888888]/40" />
                    <p className="text-sm font-bold text-[#555555]">No audit logs found.</p>
                    <p className="text-xs text-[#888888] mt-0.5">Try clearing or broadening your search criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const ts = formatTimestamp(log.timestamp);
                  const isCopied = copiedId === log.id;

                  return (
                    <tr key={log.id} className="hover:bg-[#f8faf6] transition-colors">
                      {/* Timestamp */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                          <div>
                            <span className="font-bold text-[#101010] block text-xs">
                              {typeof ts === 'object' ? ts.date : ts}
                            </span>
                            {typeof ts === 'object' && ts.time && (
                              <span className="text-[10px] text-[#888888] font-mono">
                                {ts.time}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#f0f4ec] border border-[#8cc540]/40 flex items-center justify-center text-[#436320] font-black text-xs shrink-0">
                            {log.userName ? log.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-[#101010] block leading-tight">
                              {log.userName || log.userId || 'Unknown Actor'}
                            </span>
                            <span className="text-[10px] text-[#666666] capitalize font-medium">
                              {log.userRole ? log.userRole.replace('_', ' ') : 'User'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getActionBadgeClass(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f8faf6] border border-[#e2ebd9] text-[#555555]">
                          {getEntityIcon(log.entityType)}
                          <span className="capitalize font-bold text-xs">{log.entityType}</span>
                        </div>
                      </td>

                      {/* Details */}
                      <td className="py-4 px-5 max-w-md">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 leading-relaxed text-[#333333] font-medium text-xs">
                            {log.details}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopyDetails(log.details, log.id)}
                            className="p-1 rounded-lg text-[#888888] hover:text-[#101010] hover:bg-[#f0f4ec] transition-colors shrink-0 cursor-pointer"
                            title="Copy details text"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Detail Modal Action */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="p-2 rounded-xl text-[#555555] hover:text-[#101010] hover:bg-[#f0f4ec] transition-colors cursor-pointer"
                          title="View Full Entry Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredLogs.length > 0 && (
          <div className="p-4 border-t border-[#e2ebd9] bg-[#f8faf6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[#666666] font-medium">
              Showing{' '}
              <strong className="text-[#101010]">
                {Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)}
              </strong>{' '}
              to{' '}
              <strong className="text-[#101010]">
                {Math.min(currentPage * pageSize, filteredLogs.length)}
              </strong>{' '}
              of <strong className="text-[#101010]">{filteredLogs.length}</strong> events
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[#e2ebd9] bg-white text-[#555555] hover:bg-[#f0f4ec] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[#e2ebd9] bg-white text-[#555555] hover:bg-[#f0f4ec] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-[#101010] font-mono">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[#e2ebd9] bg-white text-[#555555] hover:bg-[#f0f4ec] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[#e2ebd9] bg-white text-[#555555] hover:bg-[#f0f4ec] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white border border-[#e2ebd9] rounded-3xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#e2ebd9] bg-[#f8faf6]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#8cc540]/20 text-[#436320]">
                  {getEntityIcon(selectedLog.entityType)}
                </div>
                <div>
                  <h3 className="text-base font-black text-[#101010]">
                    Audit Log Entry
                  </h3>
                  <span className="text-xs text-[#666666] font-mono">
                    ID: {selectedLog.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl text-[#888888] hover:text-[#101010] hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
                  <span className="text-[10px] font-bold text-[#666666] uppercase block">
                    Timestamp
                  </span>
                  <span className="font-bold text-[#101010] mt-0.5 block">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
                  <span className="text-[10px] font-bold text-[#666666] uppercase block">
                    Actor
                  </span>
                  <span className="font-bold text-[#101010] mt-0.5 block">
                    {selectedLog.userName} ({selectedLog.userRole})
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
                  <span className="text-[10px] font-bold text-[#666666] uppercase block">
                    Action
                  </span>
                  <span className="font-black text-[#436320] mt-0.5 block">
                    {selectedLog.action}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
                  <span className="text-[10px] font-bold text-[#666666] uppercase block">
                    Entity Type / ID
                  </span>
                  <span className="font-bold text-[#101010] mt-0.5 block capitalize">
                    {selectedLog.entityType} ({selectedLog.entityId || 'N/A'})
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-[#555555] uppercase tracking-wider block mb-1.5">
                  Action Details
                </span>
                <div className="p-4 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] text-xs text-[#101010] font-medium leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>

              {/* Old vs New Values if available */}
              {(selectedLog.oldValue || selectedLog.newValue) && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-[#555555] uppercase tracking-wider block">
                    State Changes
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {selectedLog.oldValue && (
                      <div>
                        <span className="text-[10px] font-bold text-rose-700 block mb-1">
                          Previous State
                        </span>
                        <pre className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-rose-950 font-mono text-[11px] overflow-x-auto max-h-40">
                          {typeof selectedLog.oldValue === 'object'
                            ? JSON.stringify(selectedLog.oldValue, null, 2)
                            : String(selectedLog.oldValue)}
                        </pre>
                      </div>
                    )}

                    {selectedLog.newValue && (
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 block mb-1">
                          New State
                        </span>
                        <pre className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-950 font-mono text-[11px] overflow-x-auto max-h-40">
                          {typeof selectedLog.newValue === 'object'
                            ? JSON.stringify(selectedLog.newValue, null, 2)
                            : String(selectedLog.newValue)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#e2ebd9] bg-[#f8faf6] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-[#f0f4ec] text-[#101010] border border-[#e2ebd9] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
