import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  Filter,
  User,
  Eye,
  Trophy,
} from 'lucide-react';
import { calculateSalesHistoryComparison } from '../../services/salesCalculationService';

export const SalesMonthlyHistoryView: React.FC = () => {
  const { salesEmployees, salesRecords, salesSettings, setSelectedEmployeeForDetail } = useSales();
  const { availableMonths, availableYears, selectedMonth, selectedYear } = useApp();

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    salesEmployees.length > 0 ? salesEmployees[0].id : ''
  );
  const [search, setSearch] = useState<string>('');

  const activeEmployees = salesEmployees.filter((e) => e.status === 'active');
  const selectedEmp = activeEmployees.find((e) => e.id === selectedEmpId) || activeEmployees[0];

  const history = selectedEmp ? calculateSalesHistoryComparison(salesRecords, selectedEmp.id) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
              Progression Audit
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • Month-over-Month Comparisons
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1">
            Monthly Performance History & Comparison
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            Evaluate individual rep trajectory, score change deltas, and conversion trends over time
          </p>
        </div>
      </div>

      {/* Employee Selector & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Rep Directory List */}
        <div className="bg-white rounded-3xl border border-[#e2ebd9] p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#101010] uppercase tracking-wider">
            Select Sales Rep
          </h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
            <input
              type="text"
              placeholder="Search reps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#f8faf6] border border-[#e2ebd9] rounded-xl text-xs text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {activeEmployees
              .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
              .map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedEmp?.id === emp.id
                      ? 'bg-[#f3f8ef] border-[#8cc540] text-[#101010] shadow-xs'
                      : 'bg-white border-[#e2ebd9] hover:bg-[#f8faf6]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        emp.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={emp.name}
                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#e2ebd9]"
                    />
                    <div>
                      <div className="text-xs font-black">{emp.name}</div>
                      <div className="text-[10px] text-[#666666]">
                        {emp.department} • {emp.profileCode} Profile
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right: Selected Rep Progression Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEmp && (
            <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs space-y-6">
              {/* Rep Banner */}
              <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={
                      selectedEmp.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={selectedEmp.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#8cc540]"
                  />
                  <div>
                    <h3 className="text-lg font-black text-[#101010]">{selectedEmp.name}</h3>
                    <p className="text-xs text-[#666666]">
                      {selectedEmp.department} Sales Division • {selectedEmp.profileCode} Profile
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEmployeeForDetail(selectedEmp)}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#f8faf6] hover:bg-[#edf4e8] text-[#436320] border border-[#e2ebd9] flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Full Profile
                </button>
              </div>

              {/* Progression History Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#101010] uppercase tracking-wider">
                  Month-Over-Month Comparison Log
                </h4>

                {history.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-[#e2ebd9]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#f8faf6] text-[#666666] font-bold uppercase text-[10px] border-b border-[#e2ebd9]">
                        <tr>
                          <th className="p-3">Evaluation Period</th>
                          <th className="p-3 text-right">Score</th>
                          <th className="p-3 text-right">Score Δ</th>
                          <th className="p-3 text-right">Conv. Rate</th>
                          <th className="p-3 text-right">Orders</th>
                          <th className="p-3 text-right">Repeat</th>
                          <th className="p-3 text-right">Reward</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f4ec]">
                        {history.map((h) => (
                          <tr key={`${h.month}_${h.year}`} className="hover:bg-[#f8faf6]">
                            <td className="p-3 font-bold text-[#101010]">
                              {h.month} {h.year}
                            </td>
                            <td className="p-3 text-right font-black text-sm text-[#101010]">
                              {h.score} pts
                            </td>
                            <td className="p-3 text-right font-black">
                              {h.scoreChange !== undefined ? (
                                h.scoreChange > 0 ? (
                                  <span className="text-emerald-700 flex items-center justify-end gap-0.5">
                                    <ArrowUpRight className="w-3.5 h-3.5" /> +{h.scoreChange}
                                  </span>
                                ) : h.scoreChange < 0 ? (
                                  <span className="text-rose-600 flex items-center justify-end gap-0.5">
                                    <ArrowDownRight className="w-3.5 h-3.5" /> {h.scoreChange}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 flex items-center justify-end gap-0.5">
                                    <Minus className="w-3 h-3" /> 0.0
                                  </span>
                                )
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="p-3 text-right font-black text-emerald-700">
                              {h.conversionRate}%
                            </td>
                            <td className="p-3 text-right font-medium text-[#101010]">
                              <div>{h.orders}</div>
                              {h.orderChange !== undefined && (
                                <div className="text-[10px] text-[#777777]">
                                  {h.orderChange >= 0 ? `+${h.orderChange}` : h.orderChange}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-right font-medium text-[#101010]">
                              <div>{h.repeatOrders}</div>
                              {h.repeatOrderChange !== undefined && (
                                <div className="text-[10px] text-[#777777]">
                                  {h.repeatOrderChange >= 0 ? `+${h.repeatOrderChange}` : h.repeatOrderChange}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-right font-black text-[#436320]">
                              {salesSettings.currencySymbol}{(h.rewardAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  h.eligibility === 'Eligible'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {h.eligibility}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] text-center text-xs text-[#666666]">
                    No historical records available for {selectedEmp.name}.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
