import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import { SalesProfileSummary } from '../../types/sales';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  Award,
  Building,
  Users,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export const SalesReportsView: React.FC = () => {
  const {
    salesLeaderboardData,
    salesEmployees,
    salesSettings,
    itDepartmentSummary,
    smmDepartmentSummary,
    profileSummaries,
    salesRecords,
  } = useSales();

  const { selectedMonth, selectedYear } = useApp();

  const [reportType, setReportType] = useState<
    'leaderboard' | 'department' | 'profiles'
  >('leaderboard');

  const items = salesLeaderboardData.items;
  const profileList: SalesProfileSummary[] = Object.values(profileSummaries) as SalesProfileSummary[];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = '';
    if (reportType === 'leaderboard') {
      csv = `Rank,Employee,Department,Profile,Reachout,Orders,Repeat,Followups,Conversion Rate,Score\n`;
      items.forEach((i) => {
        csv += `${i.rank},"${i.employeeName}","${i.department}","${i.profileCode}",${i.totalReachout},${i.orderConvert},${i.repeatOrders},${i.followupSent},${i.conversionRate}%,${i.totalPerformanceScore}\n`;
      });
    } else if (reportType === 'department') {
      csv = `Department,Employees,Reachout,Orders,Repeat,Followups,Conversion Rate,Avg Score\n`;
      csv += `"IT Sales",${itDepartmentSummary.employeeCount},${itDepartmentSummary.totalReachout},${itDepartmentSummary.totalOrders},${itDepartmentSummary.totalRepeatOrders},${itDepartmentSummary.totalFollowups},${itDepartmentSummary.overallConversionRate}%,${itDepartmentSummary.avgScore}\n`;
      csv += `"SMM Sales",${smmDepartmentSummary.employeeCount},${smmDepartmentSummary.totalReachout},${smmDepartmentSummary.totalOrders},${smmDepartmentSummary.totalRepeatOrders},${smmDepartmentSummary.totalFollowups},${smmDepartmentSummary.overallConversionRate}%,${smmDepartmentSummary.avgScore}\n`;
    } else if (reportType === 'profiles') {
      csv = `Profile,Department,Employees,Avg Reachout,Avg Orders,Avg Repeat,Avg Conversion,Avg Score\n`;
      profileList.forEach((p) => {
        csv += `"${p.profileCode}","${p.department}",${p.employeeCount},${p.avgReachout},${p.avgOrders},${p.avgRepeatOrders},${p.avgConversionRate}%,${p.avgScore}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_${reportType}_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
              Executive Reporting
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • {selectedMonth} {selectedYear}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1">
            Sales Performance & Analytics Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            Export audit summaries, departmental KPIs, and profile analytics benchmarks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-bold text-xs border border-[#e2ebd9] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#598327]" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-2xl bg-[#8cc540] hover:bg-[#7db734] text-[#101010] font-black text-xs shadow-md shadow-[#8cc540]/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 print:hidden">
        <button
          onClick={() => setReportType('leaderboard')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            reportType === 'leaderboard'
              ? 'bg-[#101010] text-white shadow-sm'
              : 'bg-white text-[#555555] border border-[#e2ebd9] hover:bg-[#f8faf6]'
          }`}
        >
          Monthly Leaderboard Report
        </button>
        <button
          onClick={() => setReportType('department')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            reportType === 'department'
              ? 'bg-[#101010] text-white shadow-sm'
              : 'bg-white text-[#555555] border border-[#e2ebd9] hover:bg-[#f8faf6]'
          }`}
        >
          Department Summary (IT vs SMM)
        </button>
        <button
          onClick={() => setReportType('profiles')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            reportType === 'profiles'
              ? 'bg-[#101010] text-white shadow-sm'
              : 'bg-white text-[#555555] border border-[#e2ebd9] hover:bg-[#f8faf6]'
          }`}
        >
          Profile Benchmarks (PR, WR, HW, DR, RR)
        </button>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-8 shadow-xs space-y-6 print:border-none print:p-0">
        {/* Report Header */}
        <div className="border-b border-[#e2ebd9] pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-[#436320] tracking-wider uppercase">
                IT & SMM Sales CRM
              </span>
              <span className="text-xs text-[#777777]">• Official Performance Audit</span>
            </div>
            <h2 className="text-2xl font-black text-[#101010] tracking-tight mt-1">
              {reportType === 'leaderboard' && `Monthly Sales Leaderboard Audit - ${selectedMonth} ${selectedYear}`}
              {reportType === 'department' && `Department Comparative Analysis - ${selectedMonth} ${selectedYear}`}
              {reportType === 'profiles' && `Profile Benchmark Performance - ${selectedMonth} ${selectedYear}`}
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Generated on {new Date().toLocaleDateString()} • System Standard: 100-Point Target Model
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#777777] uppercase font-bold block">Active Sales Reps</span>
            <span className="text-2xl font-black text-[#436320]">
              {items.length} Reps
            </span>
          </div>
        </div>

        {/* Report Body based on type */}
        {reportType === 'leaderboard' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f8faf6] text-[#666666] font-bold uppercase text-[10px] border-b border-[#e2ebd9]">
                <tr>
                  <th className="p-3 text-center">Rank</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Profile</th>
                  <th className="p-3 text-right">Reachout</th>
                  <th className="p-3 text-right">Orders</th>
                  <th className="p-3 text-right">Repeat</th>
                  <th className="p-3 text-right">Conv. Rate</th>
                  <th className="p-3 text-right">Score</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4ec]">
                {items.map((i) => (
                  <tr key={i.id}>
                    <td className="p-3 text-center font-black">#{i.rank}</td>
                    <td className="p-3 font-bold text-[#101010]">{i.employeeName}</td>
                    <td className="p-3">{i.department}</td>
                    <td className="p-3 font-black text-[#436320]">{i.profileCode}</td>
                    <td className="p-3 text-right">{i.totalReachout}</td>
                    <td className="p-3 text-right font-bold text-[#101010]">{i.orderConvert}</td>
                    <td className="p-3 text-right">{i.repeatOrders}</td>
                    <td className="p-3 text-right font-black text-emerald-700">{i.conversionRate}%</td>
                    <td className="p-3 text-right font-black text-base text-[#101010]">{i.totalPerformanceScore}</td>
                    <td className="p-3 text-center font-bold">
                      <span className={i.conversionRate >= 10 ? 'text-emerald-700' : 'text-amber-600'}>
                        {i.conversionRate >= 10 ? 'Met Target' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'department' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* IT */}
              <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-[#101010]">IT Sales Division</h3>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {itDepartmentSummary.employeeCount} Reps
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-center">
                  <div className="p-2 rounded-xl bg-white border border-[#e2ebd9]">
                    <span className="text-[10px] text-[#777777] block">Conversion</span>
                    <span className="font-black text-emerald-700">{itDepartmentSummary.overallConversionRate}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#e2ebd9]">
                    <span className="text-[10px] text-[#777777] block">Avg Score</span>
                    <span className="font-black text-[#101010]">{itDepartmentSummary.avgScore}</span>
                  </div>
                </div>
              </div>

              {/* SMM */}
              <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-[#101010]">SMM Sales Division</h3>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {smmDepartmentSummary.employeeCount} Reps
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-center">
                  <div className="p-2 rounded-xl bg-white border border-[#e2ebd9]">
                    <span className="text-[10px] text-[#777777] block">Conversion</span>
                    <span className="font-black text-emerald-700">{smmDepartmentSummary.overallConversionRate}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#e2ebd9]">
                    <span className="text-[10px] text-[#777777] block">Avg Score</span>
                    <span className="font-black text-[#101010]">{smmDepartmentSummary.avgScore}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'profiles' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f8faf6] text-[#666666] font-bold uppercase text-[10px] border-b border-[#e2ebd9]">
                <tr>
                  <th className="p-3">Profile Code</th>
                  <th className="p-3">Profile Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-center">Reps</th>
                  <th className="p-3 text-right">Avg Reachout</th>
                  <th className="p-3 text-right">Avg Orders</th>
                  <th className="p-3 text-right">Avg Repeat</th>
                  <th className="p-3 text-right">Avg Conv. Rate</th>
                  <th className="p-3 text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4ec]">
                {profileList.map((p) => (
                  <tr key={p.profileCode}>
                    <td className="p-3 font-black text-[#436320]">{p.profileCode}</td>
                    <td className="p-3 font-bold text-[#101010]">{p.profileName}</td>
                    <td className="p-3">{p.department}</td>
                    <td className="p-3 text-center font-bold">{p.employeeCount}</td>
                    <td className="p-3 text-right">{p.avgReachout}</td>
                    <td className="p-3 text-right font-bold text-[#101010]">{p.avgOrders}</td>
                    <td className="p-3 text-right">{p.avgRepeatOrders}</td>
                    <td className="p-3 text-right font-black text-emerald-700">{p.avgConversionRate}%</td>
                    <td className="p-3 text-right font-black text-[#101010]">{p.avgScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
