import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { WinnerModal } from './components/winner/WinnerModal';
import { WeeklyDataEntryModal } from './components/member/WeeklyDataEntryModal';
import { KPISummaryCards } from './components/dashboard/KPISummaryCards';
import { LeaderboardTable } from './components/dashboard/LeaderboardTable';
import { PerformanceCharts } from './components/dashboard/PerformanceCharts';
import { TeamDashboardSwitcher } from './components/dashboard/TeamDashboardSwitcher';
import { TeamComparisonCard } from './components/dashboard/TeamComparisonCard';
import { MemberDashboard } from './components/member/MemberDashboard';
import { DataManagement } from './components/admin/DataManagement';
import { UserManagement } from './components/admin/UserManagement';
import { KPISettings } from './components/admin/KPISettings';
import { PeriodManagement } from './components/admin/PeriodManagement';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { MonthlyReportView } from './components/reports/MonthlyReportView';
import { ImportExportModal } from './components/admin/ImportExportModal';
import { ProfileRevenueAnalysisCard } from './components/dashboard/ProfileRevenueAnalysisCard';
import { CRMHomePage } from './components/dashboard/CRMHomePage';
import { SalesProvider } from './context/SalesContext';
import { PermissionProvider, usePermissions } from './context/PermissionContext';
import { SalesModuleRoot } from './components/sales/SalesModuleRoot';
import { RolesPermissionsManagement } from './components/admin/RolesPermissionsManagement';
import { SalesPerformanceEntryModal } from './components/sales/SalesPerformanceEntryModal';
import { SalesEmployeeModal } from './components/sales/SalesEmployeeModal';
import { SalesEmployeeDetailModal } from './components/sales/SalesEmployeeDetailModal';
import { SalesImportExportModal } from './components/sales/SalesImportExportModal';
import { Trophy, Crown, Sparkles, ArrowRight, Flame, ShieldAlert } from 'lucide-react';

const TAB_SECTION_MAP: Record<string, string> = {
  'dashboard': 'pm.dashboard',
  'leaderboard': 'pm.leaderboard',
  'my-performance': 'pm.my_performance',
  'admin-data': 'pm.submissions',
  'user-management': 'pm.members',
  'roles-permissions': 'admin.roles_permissions',
  'kpi-settings': 'pm.kpis',
  'period-management': 'pm.week_lock',
  'audit-logs': 'pm.audit_logs',
  'reports': 'pm.reports',
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, isSuperAdmin } = useAuth();
  const { activeModule, setActiveModule, activeTab, setActiveTab, openWinnerModal } = useApp();
  const { canAccessSection, canAccessModule } = usePermissions();
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Module Guard: Ensure user only accesses enabled modules
  React.useEffect(() => {
    if (activeModule === 'pm' && !canAccessModule('pm') && canAccessModule('sales')) {
      setActiveModule('sales');
    } else if (activeModule === 'sales' && !canAccessModule('sales') && canAccessModule('pm')) {
      setActiveModule('pm');
    }
  }, [activeModule, canAccessModule, setActiveModule]);

  // Tab Security Guard: Prevent users from accessing tabs their role is not authorized to view
  React.useEffect(() => {
    if (activeModule === 'pm') {
      // Allow roles-permissions to remain active to show explicit 403 Forbidden when unauthorized
      if (activeTab === 'roles-permissions') {
        return;
      }
      const requiredSection = TAB_SECTION_MAP[activeTab];
      if (requiredSection && !canAccessSection(requiredSection)) {
        // Fallback to the first accessible PM tab
        const accessibleTab = Object.keys(TAB_SECTION_MAP).find((tab) =>
          canAccessSection(TAB_SECTION_MAP[tab])
        );
        if (accessibleTab) {
          setActiveTab(accessibleTab as any);
        } else if (canAccessModule('sales')) {
          setActiveModule('sales');
        }
      }
    }
  }, [activeTab, activeModule, canAccessSection, canAccessModule, setActiveTab, setActiveModule]);

  // URL / Direct Access Handling: Support direct tab / action checks
  React.useEffect(() => {
    const handleUrlNavigation = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') || window.location.hash.replace('#', '');
        if (tabParam === 'roles-permissions') {
          setActiveTab('roles-permissions');
        }
        const switchParam = params.get('switchView') || params.get('switchUser');
        if (switchParam && !isSuperAdmin) {
          console.error('403 Forbidden\nYou do not have permission to access this feature.');
        }
      } catch (err) {
        console.error('URL navigation parse error:', err);
      }
    };
    handleUrlNavigation();
    window.addEventListener('popstate', handleUrlNavigation);
    window.addEventListener('hashchange', handleUrlNavigation);
    return () => {
      window.removeEventListener('popstate', handleUrlNavigation);
      window.removeEventListener('hashchange', handleUrlNavigation);
    };
  }, [isSuperAdmin, setActiveTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f8ef] flex flex-col items-center justify-center text-[#101010] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8cc540] to-[#6da525] animate-spin p-0.5 flex items-center justify-center shadow-lg shadow-[#8cc540]/20">
          <div className="w-full h-full bg-white rounded-[14px]"></div>
        </div>
        <p className="text-sm font-bold tracking-widest text-[#101010] uppercase animate-pulse">
          Loading IT SMM Tigers...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f8ef] text-[#101010] flex flex-col selection:bg-[#8cc540] selection:text-[#101010]">
      {/* Global Header */}
      <Header />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {activeModule === 'sales' ? (
          <SalesModuleRoot />
        ) : (
          <>
            {/* DASHBOARD / HOME PAGE TAB */}
            {activeTab === 'dashboard' && <CRMHomePage />}

            {/* LEADERBOARD TAB */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-[#101010] tracking-tight">Full Team Leaderboard</h1>
                    <p className="text-xs text-[#666666]">
                      Performance ranking sorted by weighted scores and verified tie-breakers
                    </p>
                  </div>
                  <button
                    onClick={openWinnerModal}
                    className="px-4 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/25 cursor-pointer transition-all"
                  >
                    🏆 View Winner Podium
                  </button>
                </div>
                <TeamDashboardSwitcher />
                <LeaderboardTable />
                <PerformanceCharts />
              </div>
            )}

            {/* MY PERFORMANCE TAB */}
            {activeTab === 'my-performance' && canAccessSection('pm.my_performance') && <MemberDashboard />}

            {/* ADMIN DATA MANAGEMENT TAB */}
            {activeTab === 'admin-data' && canAccessSection('pm.submissions') && (
              <DataManagement onOpenImportModal={() => setIsImportModalOpen(true)} />
            )}

            {/* USER MANAGEMENT TAB */}
            {activeTab === 'user-management' && canAccessSection('pm.members') && <UserManagement />}

            {/* KPI SETTINGS TAB */}
            {activeTab === 'kpi-settings' && canAccessSection('pm.kpis') && <KPISettings />}

            {/* PERIOD MANAGEMENT TAB */}
            {activeTab === 'period-management' && canAccessSection('pm.week_lock') && <PeriodManagement />}

            {/* AUDIT LOGS TAB */}
            {activeTab === 'audit-logs' && canAccessSection('pm.audit_logs') && <AuditLogsView />}

            {/* ROLES & PERMISSIONS TAB */}
            {activeTab === 'roles-permissions' && (
              isSuperAdmin ? (
                <RolesPermissionsManagement />
              ) : (
                <div className="bg-white rounded-3xl p-12 border border-rose-200 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-black text-[#101010]">403 Forbidden</h2>
                  <p className="text-sm text-[#666666]">
                    You do not have permission to access this feature.
                  </p>
                </div>
              )
            )}

            {/* MONTHLY REPORT TAB */}
            {activeTab === 'reports' && canAccessSection('pm.reports') && <MonthlyReportView />}

            {/* ACCESS DENIED FALLBACK */}
            {activeTab !== 'roles-permissions' && TAB_SECTION_MAP[activeTab] && !canAccessSection(TAB_SECTION_MAP[activeTab]) && (
              <div className="bg-white rounded-3xl p-12 border border-rose-200 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-[#101010]">Access Restricted</h2>
                <p className="text-sm text-[#666666]">
                  Your role is currently not authorized to access this section. If you believe this is in error, please contact your Super Administrator.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <WinnerModal />
      <WeeklyDataEntryModal />
      <ImportExportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
      <SalesPerformanceEntryModal />
      <SalesEmployeeModal />
      <SalesEmployeeDetailModal />
      <SalesImportExportModal />

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <PermissionProvider>
          <SalesProvider>
            <AppContent />
          </SalesProvider>
        </PermissionProvider>
      </AppProvider>
    </AuthProvider>
  );
}
