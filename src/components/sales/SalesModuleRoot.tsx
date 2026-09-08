import React, { useEffect } from 'react';
import { useSales, SalesTab } from '../../context/SalesContext';
import { useAuth } from '../../context/AuthContext';
import { isUserSuperAdmin } from '../../utils/salesAuthUtils';
import {
  LayoutDashboard,
  Users,
  Calculator,
  Trophy,
  Target,
  TrendingUp,
  FileText,
  Sliders,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
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

export const SalesModuleRoot: React.FC = () => {
  const { salesActiveTab, setSalesActiveTab } = useSales();
  const { currentUser } = useAuth();
  const isSuperAdmin = isUserSuperAdmin(currentUser);

  // If a Sales Member tries to land on an admin-only tab, redirect to sales-dashboard
  useEffect(() => {
    if (!isSuperAdmin) {
      const adminOnlyTabs: SalesTab[] = [
        'sales-employees',
        'sales-reports',
        'sales-settings',
        'sales-leaderboard',
        'sales-audit',
      ];
      if (adminOnlyTabs.includes(salesActiveTab)) {
        setSalesActiveTab('sales-dashboard');
      }
    }
  }, [isSuperAdmin, salesActiveTab, setSalesActiveTab]);

  return (
    <div className="space-y-6">
      {/* Tab Content */}
      <div className="transition-all duration-150">
        {salesActiveTab === 'sales-dashboard' && <SalesDashboard />}
        {salesActiveTab === 'sales-my-performance' && <SalesMyPerformanceView />}
        {salesActiveTab === 'sales-leaderboard' && isSuperAdmin && <SalesLeaderboardView />}
        {salesActiveTab === 'sales-performance' && <SalesPerformanceView />}
        {salesActiveTab === 'sales-employees' && isSuperAdmin && <SalesEmployeesView />}
        {salesActiveTab === 'sales-analytics' && <SalesProfilePerformanceView />}
        {salesActiveTab === 'sales-history' && <SalesMonthlyHistoryView />}
        {salesActiveTab === 'sales-reports' && isSuperAdmin && <SalesReportsView />}
        {salesActiveTab === 'sales-audit' && isSuperAdmin && <SalesAuditLogsView />}
        {salesActiveTab === 'sales-settings' && isSuperAdmin && <SalesSettingsView />}
      </div>

      {/* Global Sales Modals */}
      <SalesPerformanceEntryModal />
      {isSuperAdmin && <SalesEmployeeModal />}
      <SalesEmployeeDetailModal />
      {isSuperAdmin && <SalesImportExportModal />}
    </div>
  );
};
