import React, { useState, useMemo, useEffect } from 'react';
import { useSales } from '../../context/SalesContext';
import { useAuth } from '../../context/AuthContext';
import { isUserSuperAdmin } from '../../utils/salesAuthUtils';
import { SalesAuditLog } from '../../types/sales';
import { SalesDataService } from '../../services/salesDataService';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  CheckCircle2,
  XCircle,
  FileCode,
  ArrowRight,
  Eye,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export const SalesAuditLogsView: React.FC = () => {
  const { auditLogs, refreshAuditLogs } = useSales();
  const { currentUser } = useAuth();
  const isSuperAdmin = isUserSuperAdmin(currentUser);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [activeLogDiff, setActiveLogDiff] = useState<SalesAuditLog | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      refreshAuditLogs();
    }
  }, [isSuperAdmin]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAuditLogs();
    setIsRefreshing(false);
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUser = log.userName?.toLowerCase().includes(q) || log.userId?.toLowerCase().includes(q);
        const matchesAction = log.action?.toLowerCase().includes(q);
        const matchesDetails = log.details?.toLowerCase().includes(q);
        const matchesRecordType = log.recordType?.toLowerCase().includes(q);
        const matchesId = log.entityId?.toLowerCase().includes(q) || log.id?.toLowerCase().includes(q);
        if (!matchesUser && !matchesAction && !matchesDetails && !matchesRecordType && !matchesId) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'member') {
          if (log.actionCategory !== 'member' && log.entityType !== 'employee' && !log.action.includes('EMPLOYEE')) return false;
        } else if (selectedCategory === 'performance') {
          if (log.actionCategory !== 'performance' && log.entityType !== 'record' && !log.action.includes('RECORD')) return false;
        } else if (selectedCategory === 'configuration') {
          if (log.actionCategory !== 'configuration' && log.entityType !== 'settings' && log.entityType !== 'target' && !log.action.includes('SETTINGS')) return false;
        } else if (selectedCategory === 'import_export') {
          if (log.actionCategory !== 'import_export' && !log.action.includes('IMPORT') && !log.action.includes('EXPORT')) return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all') {
        const logStatus = log.status || 'Success';
        if (logStatus.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      }

      // Date filter
      if (selectedDateRange !== 'all') {
        const logTime = new Date(log.timestamp).getTime();
        const now = Date.now();
        if (selectedDateRange === 'today' && now - logTime > 86400000) return false;
        if (selectedDateRange === 'week' && now - logTime > 7 * 86400000) return false;
        if (selectedDateRange === 'month' && now - logTime > 30 * 86400000) return false;
      }

      return true;
    });
  }, [auditLogs, searchQuery, selectedCategory, selectedStatus, selectedDateRange]);

  // Export CSV
  const handleExportCSV = async () => {
    if (filteredLogs.length === 0) return;
    const headers = [
      'Timestamp',
      'Action',
      'Module',
      'Record Type',
      'Record ID',
      'User ID',
      'User Name',
      'User Role',
      'Status',
      'Source',
      'IP Address',
      'Details',
    ];

    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.module || 'Sales'}"`,
      `"${l.recordType || l.entityType}"`,
      `"${l.entityId}"`,
      `"${l.userId}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.status || 'Success'}"`,
      `"${l.source || 'UI'}"`,
      `"${l.ipAddress || '127.0.0.1'}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (currentUser) {
      SalesDataService.logExportAction('CSV', `Exported ${filteredLogs.length} audit log entries`, {
        id: currentUser.uid || currentUser.userId || 'admin',
        name: currentUser.name || 'Super Admin',
        role: currentUser.role,
      });
    }
  };

  // Export JSON
  const handleExportJSON = async () => {
    if (filteredLogs.length === 0) return;
    const jsonStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    if (currentUser) {
      SalesDataService.logExportAction('JSON', `Exported ${filteredLogs.length} audit log entries`, {
        id: currentUser.uid || currentUser.userId || 'admin',
        name: currentUser.name || 'Super Admin',
        role: currentUser.role,
      });
    }
  };

  // Non-Super Admin Access Denied Banner
  if (!isSuperAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-xl mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-[#101010] mb-2">403 Forbidden: Access Restricted</h2>
        <p className="text-sm text-[#666666] leading-relaxed">
          The Sales Audit Logs module is restricted to <strong>Super Admin</strong> personnel only. Sales Members are not permitted to inspect compliance audit trails.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#598327]/10 text-[#598327] border border-[#598327]/20">
              Super Admin Security
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
              Module: Sales
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#101010] tracking-tight">Sales Module Audit Logs</h1>
          <p className="text-xs text-[#666666] mt-1">
            Immutable, backend-level audit trail tracking all Sales user actions, performance entries, profile assignments, target updates, and data transfers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl text-xs font-black border border-[#e2ebd9] text-[#101010] hover:bg-[#f8faf6] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#598327] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-[#598327] text-white hover:bg-[#4d7222] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl text-xs font-black border border-[#e2ebd9] text-[#101010] hover:bg-[#f8faf6] flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#598327]" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#e2ebd9] p-4 shadow-xs">
          <div className="text-[11px] font-black uppercase tracking-wider text-[#666666] mb-1">Total Audit Events</div>
          <div className="text-2xl font-black text-[#101010]">{auditLogs.length}</div>
          <div className="text-[10px] text-[#888888] mt-1">Stored backend records</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e2ebd9] p-4 shadow-xs">
          <div className="text-[11px] font-black uppercase tracking-wider text-[#666666] mb-1">Member Actions</div>
          <div className="text-2xl font-black text-[#598327]">
            {auditLogs.filter((l) => l.actionCategory === 'member' || l.action.includes('EMPLOYEE') || l.action.includes('PROFILE')).length}
          </div>
          <div className="text-[10px] text-[#888888] mt-1">Assignments & members</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e2ebd9] p-4 shadow-xs">
          <div className="text-[11px] font-black uppercase tracking-wider text-[#666666] mb-1">Performance Actions</div>
          <div className="text-2xl font-black text-[#101010]">
            {auditLogs.filter((l) => l.actionCategory === 'performance' || l.action.includes('RECORD')).length}
          </div>
          <div className="text-[10px] text-[#888888] mt-1">Daily & weekly entries</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e2ebd9] p-4 shadow-xs">
          <div className="text-[11px] font-black uppercase tracking-wider text-[#666666] mb-1">Config & Settings</div>
          <div className="text-2xl font-black text-amber-600">
            {auditLogs.filter((l) => l.actionCategory === 'configuration' || l.action.includes('SETTINGS')).length}
          </div>
          <div className="text-[10px] text-[#888888] mt-1">Targets, weights, slabs</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#e2ebd9] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user, action, record ID, or details..."
              className="w-full pl-9 pr-4 py-2 bg-[#fbfdfa] border border-[#e2ebd9] rounded-xl text-xs font-bold text-[#101010] placeholder-[#888888] focus:outline-none focus:border-[#598327]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-[#fbfdfa] border border-[#e2ebd9] rounded-xl text-xs font-bold text-[#101010] focus:outline-none focus:border-[#598327]"
            >
              <option value="all">All Categories</option>
              <option value="member">Member & Profile Actions</option>
              <option value="performance">Performance Entry Actions</option>
              <option value="configuration">Configuration & Settings</option>
              <option value="import_export">Import & Export Operations</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-[#fbfdfa] border border-[#e2ebd9] rounded-xl text-xs font-bold text-[#101010] focus:outline-none focus:border-[#598327]"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>

            {/* Date Range */}
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-3 py-2 bg-[#fbfdfa] border border-[#e2ebd9] rounded-xl text-xs font-bold text-[#101010] focus:outline-none focus:border-[#598327]"
            >
              <option value="all">All Time</option>
              <option value="today">Today (24h)</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#666666] pt-1 border-t border-[#f0f4ec]">
          <span>Showing {filteredLogs.length} of {auditLogs.length} log events</span>
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedDateRange !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedDateRange('all');
              }}
              className="text-[#598327] font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#e2ebd9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fbfdfa] text-[#666666] font-black border-b border-[#e2ebd9]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Record Type & ID</th>
                <th className="py-3 px-4">Performed By</th>
                <th className="py-3 px-4">Details / Summary</th>
                <th className="py-3 px-4">Source & IP</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ec]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#888888]">
                    No audit records match your current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSuccess = (log.status || 'Success').toLowerCase() === 'success';
                  const date = new Date(log.timestamp);
                  const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <tr key={log.id} className="hover:bg-[#f8faf6] transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#101010]">{formattedDate}</div>
                        <div className="text-[10px] text-[#888888] font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formattedTime}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            log.action.includes('CREATE') || log.action.includes('ASSIGN')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.action.includes('DELETE') || log.action.includes('REMOVE')
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : log.action.includes('UPDATE')
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Record Type & ID */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#101010] truncate max-w-[140px]">
                          {log.recordType || log.entityType}
                        </div>
                        <div className="text-[10px] font-mono text-[#888888] truncate max-w-[140px]">
                          {log.entityId}
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#101010] flex items-center gap-1.5">
                          <User className="w-3 h-3 text-[#598327]" />
                          <span>{log.userName}</span>
                        </div>
                        <div className="text-[10px] text-[#666666]">
                          Role: <span className="font-semibold text-slate-800">{log.userRole}</span>
                        </div>
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4">
                        <div className="text-xs text-[#222222] font-medium leading-snug max-w-sm line-clamp-2">
                          {log.details}
                        </div>
                      </td>

                      {/* Source & IP */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-[11px] font-bold text-[#444444]">{log.source || 'UI'}</div>
                        <div className="text-[10px] font-mono text-[#888888]">{log.ipAddress || '127.0.0.1'}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isSuccess
                              ? 'bg-[#8cc540]/15 text-[#598327] border border-[#8cc540]/30'
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}
                        >
                          {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{log.status || 'Success'}</span>
                        </span>
                      </td>

                      {/* Inspection / Diff Viewer */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {(log.previousValue || log.newValue) ? (
                          <button
                            onClick={() => setActiveLogDiff(log)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-black text-[#598327] hover:bg-[#598327]/10 border border-[#598327]/20 flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect Diff</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#aaaaaa]">No payload</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diff / Value Inspector Modal */}
      {activeLogDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#e2ebd9] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#e2ebd9] flex items-center justify-between bg-[#fbfdfa]">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#598327]/10 text-[#598327] border border-[#598327]/20">
                  Audit Inspection
                </span>
                <h3 className="text-lg font-black text-[#101010] mt-1">
                  {activeLogDiff.action.replace(/_/g, ' ')}
                </h3>
                <p className="text-xs text-[#666666]">
                  Event ID: <span className="font-mono text-[#101010]">{activeLogDiff.id}</span> • Executed by{' '}
                  <strong>{activeLogDiff.userName}</strong> ({activeLogDiff.userRole})
                </p>
              </div>
              <button
                onClick={() => setActiveLogDiff(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-[#f8faf6] rounded-xl p-3 border border-[#e2ebd9] text-xs">
                <div className="font-bold text-[#101010] mb-0.5">Summary Details:</div>
                <div className="text-[#444444]">{activeLogDiff.details}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Previous Value */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                      Previous Value (Before)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeLogDiff.previousValue ? 'State Snapshot' : 'None / Newly Created'}
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-800 bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto max-h-64 flex-1">
                    {activeLogDiff.previousValue
                      ? JSON.stringify(activeLogDiff.previousValue, null, 2)
                      : '// No previous record (new creation)'}
                  </pre>
                </div>

                {/* New Value */}
                <div className="border border-[#e2ebd9] rounded-2xl p-4 bg-[#fbfdfa] flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#598327]">
                      New Value (After Change)
                    </span>
                    <span className="text-[10px] text-[#598327] font-mono">Recorded State</span>
                  </div>
                  <pre className="text-[11px] font-mono text-[#101010] bg-white p-3 rounded-xl border border-[#e2ebd9] overflow-x-auto max-h-64 flex-1">
                    {activeLogDiff.newValue
                      ? JSON.stringify(activeLogDiff.newValue, null, 2)
                      : '// Record was permanently deleted'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#e2ebd9] bg-[#fbfdfa] flex justify-end">
              <button
                onClick={() => setActiveLogDiff(null)}
                className="px-5 py-2 bg-[#101010] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
