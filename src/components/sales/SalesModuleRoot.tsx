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
      const adminOnlyTabs: SalesTab[] = ['sales-employees', 'sales-reports', 'sales-settings', 'sales-leaderboard'];
      if (adminOnlyTabs.includes(salesActiveTab)) {
        setSalesActiveTab('sales-dashboard');
      }
    }
  }, [isSuperAdmin, salesActiveTab, setSalesActiveTab]);

  const allNavTabs: { id: SalesTab; label: string; icon: React.FC<{ className?: string }>; adminOnly?: boolean }[] = [
    { id: 'sales-dashboard', label: isSuperAdmin ? 'Sales Dashboard' : 'My Dashboard', icon: LayoutDashboard },
    { id: 'sales-leaderboard', label: 'Sales Leaderboard', icon: Trophy, adminOnly: true },
    { id: 'sales-performance', label: isSuperAdmin ? 'Performance Records' : 'My Performance Records', icon: Calculator },
    { id: 'sales-employees', label: 'Sales Members', icon: Users, adminOnly: true },
    { id: 'sales-analytics', label: isSuperAdmin ? 'Profile Benchmarks' : 'My Profile Targets', icon: Target },
    { id: 'sales-history', label: isSuperAdmin ? 'Monthly History' : 'My Progression History', icon: TrendingUp },
    { id: 'sales-reports', label: 'Reports & Export', icon: FileText, adminOnly: true },
    { id: 'sales-settings', label: 'Target & Rewards', icon: Sliders, adminOnly: true },
  ];

  const visibleTabs = allNavTabs.filter((tab) => !tab.adminOnly || isSuperAdmin);

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Bar for Sales Module */}
      <div className="bg-white rounded-2xl border border-[#e2ebd9] p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = salesActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSalesActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#8cc540] text-[#101010] shadow-sm'
                    : 'text-[#666666] hover:text-[#101010] hover:bg-[#f8faf6]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#101010]' : 'text-[#598327]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-150">
        {salesActiveTab === 'sales-dashboard' && <SalesDashboard />}
        {salesActiveTab === 'sales-leaderboard' && isSuperAdmin && <SalesLeaderboardView />}
        {salesActiveTab === 'sales-performance' && <SalesPerformanceView />}
        {salesActiveTab === 'sales-employees' && isSuperAdmin && <SalesEmployeesView />}
        {salesActiveTab === 'sales-analytics' && <SalesProfilePerformanceView />}
        {salesActiveTab === 'sales-history' && <SalesMonthlyHistoryView />}
        {salesActiveTab === 'sales-reports' && isSuperAdmin && <SalesReportsView />}
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
