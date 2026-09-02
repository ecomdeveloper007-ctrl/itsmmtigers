import React, { useState, useRef } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import { X, Upload, Download, FileText, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';

export const SalesImportExportModal: React.FC = () => {
  const {
    isSalesImportModalOpen,
    setIsSalesImportModalOpen,
    importSalesCSV,
    salesLeaderboardData,
    salesSettings,
    salesRecords,
  } = useSales();

  const { selectedMonth, selectedYear } = useApp();

  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [csvText, setCsvText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isSalesImportModalOpen) return null;

  const sampleCsvTemplate = `Employee,Department,Profile,Month,Total Reachout,Order Convert,Repeat Orders,Follow-up Sent
Rahul Sharma,IT,PR,September,220,23,9,115
Vikram Verma,IT,WR,September,185,19,8,95
Amit Kumar,IT,HW,September,155,16,7,82
Divya Nair,SMM,DR,September,270,28,11,130
Pooja Joshi,SMM,RR,September,235,24,10,118`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content || '');
    };
    reader.readAsText(file);
  };

  const handleRunImport = async () => {
    if (!csvText.trim()) {
      setResultMessage({ type: 'error', text: 'Please upload a CSV file or paste data into the text box.' });
      return;
    }

    setIsProcessing(true);
    setResultMessage(null);

    const res = await importSalesCSV(csvText);
    setIsProcessing(false);

    if (res.success) {
      setResultMessage({
        type: 'success',
        text: `Successfully processed and calculated ${res.count} monthly performance records.`,
      });
      setCsvText('');
    } else {
      setResultMessage({
        type: 'error',
        text: `Import failed: ${res.errors.join(', ')}`,
      });
    }
  };

  const downloadSampleTemplate = () => {
    const blob = new Blob([sampleCsvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_performance_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCurrentLeaderboardCsv = () => {
    const items = salesLeaderboardData.items;
    let csv = `Rank,Employee,Department,Profile,Reachout,Order Convert,Repeat Orders,Follow-up Sent,Conversion Rate %,Score,Reward Level,Reward Amount,Eligibility,Remarks\n`;

    items.forEach((item) => {
      csv += `${item.rank},"${item.employeeName}","${item.department}","${item.profileCode}",${item.totalReachout},${item.orderConvert},${item.repeatOrders},${item.followupSent},${item.conversionRate}%,${item.totalPerformanceScore},"${item.rewardLevel}",${item.rewardAmount},"${item.rewardEligibility}","${item.managerRemarks || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_leaderboard_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl border border-[#e2ebd9] shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8cc540]/20 flex items-center justify-center text-[#436320] border border-[#8cc540]/40">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#101010] tracking-tight">Sales Data Import & Export</h2>
              <p className="text-xs text-[#666666]">
                Bulk import monthly performance data or export comprehensive CSV audit files
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSalesImportModalOpen(false)}
            className="p-2 rounded-xl text-[#666666] hover:text-[#101010] hover:bg-[#f5f5f5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#f5f5f5] p-1 border border-[#e2ebd9]">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'import' ? 'bg-[#8cc540] text-[#101010] shadow-xs' : 'text-[#666666] hover:text-[#101010]'
            }`}
          >
            <Upload className="w-4 h-4" /> Import CSV Data
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'export' ? 'bg-[#8cc540] text-[#101010] shadow-xs' : 'text-[#666666] hover:text-[#101010]'
            }`}
          >
            <Download className="w-4 h-4" /> Export Reports
          </button>
        </div>

        {resultMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              resultMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {resultMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{resultMessage.text}</span>
          </div>
        )}

        {activeTab === 'import' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#101010]">Upload CSV File</span>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="text-xs font-bold text-[#436320] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Sample CSV Template
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#8cc540]/60 hover:border-[#8cc540] bg-[#f8faf6] rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
            >
              <Upload className="w-8 h-8 text-[#598327] mx-auto" />
              <p className="text-xs font-bold text-[#101010]">
                Click or drag & drop CSV file to upload
              </p>
              <p className="text-[10px] text-[#777777]">
                Supported: .csv files containing employee reachout and order convert metrics
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-[#101010]">
                Or Paste CSV Content
              </label>
              <textarea
                rows={5}
                placeholder={sampleCsvTemplate}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl p-3 font-mono text-xs text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleRunImport}
                disabled={isProcessing || !csvText.trim()}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{isProcessing ? 'Processing...' : 'Calculate & Import Data'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[#666666]">
              Download structured data exports in CSV format for executive analysis, payroll calculation, or spreadsheets.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#101010]">
                    Monthly Sales Leaderboard Export ({selectedMonth} {selectedYear})
                  </h4>
                  <p className="text-[11px] text-[#666666]">
                    Complete ranks, targets, conversions, performance scores, and reward payouts.
                  </p>
                </div>
                <button
                  onClick={exportCurrentLeaderboardCsv}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
