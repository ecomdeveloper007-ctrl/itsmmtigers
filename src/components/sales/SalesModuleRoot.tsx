import React from 'react';
import { useSales, SalesTab } from '../../context/SalesContext';
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

  const navTabs: { id: SalesTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'sales-dashboard', label: 'Sales Dashboard', icon: LayoutDashboard },
    { id: 'sales-leaderboard', label: 'Sales Leaderboard', icon: Trophy },
    { id: 'sales-performance', label: 'Performance Records', icon: Calculator },
    { id: 'sales-employees', label: 'Sales Employees', icon: Users },
    { id: 'sales-analytics', label: 'Profile Benchmarks', icon: Target },
    { id: 'sales-history', label: 'Monthly History', icon: TrendingUp },
    { id: 'sales-reports', label: 'Reports & Export', icon: FileText },
    { id: 'sales-settings', label: 'Reward Settings', icon: Sliders },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Bar for Sales Module */}
      <div className="bg-white rounded-2xl border border-[#e2ebd9] p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {navTabs.map((tab) => {
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
        {salesActiveTab === 'sales-leaderboard' && <SalesLeaderboardView />}
        {salesActiveTab === 'sales-performance' && <SalesPerformanceView />}
        {salesActiveTab === 'sales-employees' && <SalesEmployeesView />}
        {salesActiveTab === 'sales-analytics' && <SalesProfilePerformanceView />}
        {salesActiveTab === 'sales-history' && <SalesMonthlyHistoryView />}
        {salesActiveTab === 'sales-reports' && <SalesReportsView />}
        {salesActiveTab === 'sales-settings' && <SalesSettingsView />}
      </div>

      {/* Global Sales Modals */}
      <SalesPerformanceEntryModal />
      <SalesEmployeeModal />
      <SalesEmployeeDetailModal />
      <SalesImportExportModal />
    </div>
  );
};
