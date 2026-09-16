import React, { useEffect } from 'react';
import { useSales, SalesTab } from '../../context/SalesContext';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';
import { ShieldAlert } from 'lucide-react';
import { SalesDashboard } from './SalesDashboard';
import { SalesEmployeesView } from './SalesEmployeesView';
import { SalesPerformanceView } from './SalesPerformanceView';
import { SalesLeaderboardView } from './SalesLeaderboardView';
import { SalesProfilePerformanceView } from './SalesProfilePerformanceView';
import { SalesDepartmentPerformanceView } from './SalesDepartmentPerformanceView';
import { SalesMonthlyHistoryView } from './SalesMonthlyHistoryView';
import { SalesReportsView } from './SalesReportsView';
import { SalesSettingsView } from './SalesSettingsView';
import { SalesAuditLogsView } from './SalesAuditLogsView';
import { SalesMyPerformanceView } from './SalesMyPerformanceView';
import { SalesPerformanceEntryModal } from './SalesPerformanceEntryModal';
import { SalesEmployeeModal } from './SalesEmployeeModal';
import { SalesEmployeeDetailModal } from './SalesEmployeeDetailModal';
import { SalesImportExportModal } from './SalesImportExportModal';

const SALES_TAB_SECTION_MAP: Record<SalesTab, string> = {
  'sales-dashboard': 'sales.dashboard',
  'sales-my-performance': 'sales.my_performance',
  'sales-performance': 'sales.performance_records',
  'sales-leaderboard': 'sales.leaderboard',
  'sales-employees': 'sales.members',
  'sales-analytics': 'sales.targets',
  'sales-history': 'sales.reports',
  'sales-reports': 'sales.reports',
  'sales-audit': 'sales.audit_logs',
  'sales-settings': 'sales.rewards',
};

export const SalesModuleRoot: React.FC = () => {
  const { salesActiveTab, setSalesActiveTab } = useSales();
  const { currentUser } = useAuth();
  const { canAccessSection, hasPermission } = usePermissions();

  // Security Guard: If user lands on a tab their role is not authorized to view, redirect to an accessible tab
  useEffect(() => {
    const requiredSection = SALES_TAB_SECTION_MAP[salesActiveTab];
    if (requiredSection && !canAccessSection(requiredSection)) {
      const allTabs = Object.keys(SALES_TAB_SECTION_MAP) as SalesTab[];
      const firstAccessible = allTabs.find((t) => canAccessSection(SALES_TAB_SECTION_MAP[t]));
      if (firstAccessible) {
        setSalesActiveTab(firstAccessible);
      }
    }
  }, [canAccessSection, salesActiveTab, setSalesActiveTab]);

  const currentSection = SALES_TAB_SECTION_MAP[salesActiveTab];
  const isTabAllowed = !currentSection || canAccessSection(currentSection);

  return (
    <div className="space-y-6">
      {/* Tab Content */}
      <div className="transition-all duration-150">
        {salesActiveTab === 'sales-dashboard' && canAccessSection('sales.dashboard') && <SalesDashboard />}
        {salesActiveTab === 'sales-my-performance' && canAccessSection('sales.my_performance') && <SalesMyPerformanceView />}
        {salesActiveTab === 'sales-leaderboard' && canAccessSection('sales.leaderboard') && <SalesLeaderboardView />}
        {salesActiveTab === 'sales-performance' && canAccessSection('sales.performance_records') && <SalesPerformanceView />}
        {salesActiveTab === 'sales-employees' && canAccessSection('sales.members') && <SalesEmployeesView />}
        {salesActiveTab === 'sales-analytics' && canAccessSection('sales.targets') && <SalesProfilePerformanceView />}
        {salesActiveTab === 'sales-history' && canAccessSection('sales.reports') && <SalesMonthlyHistoryView />}
        {salesActiveTab === 'sales-reports' && canAccessSection('sales.reports') && <SalesReportsView />}
        {salesActiveTab === 'sales-audit' && canAccessSection('sales.audit_logs') && <SalesAuditLogsView />}
        {salesActiveTab === 'sales-settings' && canAccessSection('sales.rewards') && <SalesSettingsView />}

        {/* Access Restricted Notice */}
        {!isTabAllowed && (
          <div className="bg-white rounded-3xl p-12 border border-rose-200 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-[#101010]">Access Restricted</h2>
            <p className="text-sm text-[#666666]">
              Your role does not have permission to view this section of Sales Management.
            </p>
          </div>
        )}
      </div>

      {/* Global Sales Modals */}
      <SalesPerformanceEntryModal />
      {(hasPermission('sales.members', 'create') || hasPermission('sales.members', 'edit')) && (
        <SalesEmployeeModal />
      )}
      <SalesEmployeeDetailModal />
      {(hasPermission('sales.import_export', 'import') || hasPermission('sales.import_export', 'export')) && (
        <SalesImportExportModal />
      )}
    </div>
  );
};
