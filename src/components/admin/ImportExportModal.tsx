import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Upload,
  Download,
  X,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Save,
  FileCheck,
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { PerformanceRecord } from '../../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, allUsers } = useAuth();
  const { periods, kpis, refreshAllData, addToast } = useApp();

  const [csvText, setCsvText] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<{
    validRecords: PerformanceRecord[];
    invalidRows: { rowNumber: number; reason: string; raw: string }[];
    missingConvertedCount: number;
    duplicateCount: number;
    summary: { totalRows: number; validCount: number; invalidCount: number };
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      validateCSVContent(text);
    };
    reader.readAsText(file);
  };

  const validateCSVContent = (text: string) => {
    if (!text.trim()) {
      setParsedResult(null);
      return;
    }
    const result = DataService.parseAndValidateCSV(text, allUsers, periods);
    setParsedResult(result);
  };

  const handleDownloadSampleTemplate = () => {
    const sampleHeader =
      'RecordID,Team Member Name,User ID,Month,Year,Week,Project Closed,Revenue Generated ($),Upsells,Client Rating,Follow-up Completed,Repeat Clients,Notes\n';
    const sampleRows = [
      'rec_sample_01,Divya Bhardwaj,divya.bhardwaj,August,2026,Week 1,4,1500,2,5.0,15,2,Launch campaign closure\n',
      'rec_sample_02,Mohita Sharma,mohita.sharma,August,2026,Week 1,3,1400,2,5.0,6,1,Brand growth package\n',
      'rec_sample_03,Naveen Jakhar,naveen.jakhar,August,2026,Week 1,2,1000,1,5.0,1,1,Social audit deliverables\n',
    ].join('');

    const blob = new Blob([sampleHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'IT_SMM_Tigers_Sample_Import_Template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('info', 'Template Downloaded', 'Sample CSV downloaded.');
  };

  const handleCommitImport = async () => {
    if (!parsedResult || parsedResult.validRecords.length === 0 || !currentUser) return;

    setIsProcessing(true);
    try {
      for (const rec of parsedResult.validRecords) {
        await DataService.saveRecord(rec, {
          id: currentUser.uid,
          name: currentUser.name,
          role: currentUser.role,
        });
      }

      await refreshAllData();
      addToast(
        'success',
        'CSV Import Completed',
        `Successfully imported ${parsedResult.validRecords.length} performance records.`
      );
      onClose();
    } catch (e) {
      console.error(e);
      addToast('error', 'Import Failed', 'An error occurred during database write.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-750 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/40">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Import Historical Performance Data</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Upload CSV file with automatic zero-fill validation and preview
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-750">
            <div className="flex items-center gap-3">
              <label className="px-4 py-2.5 rounded-xl text-xs font-black bg-orange-500 hover:bg-orange-400 text-slate-950 flex items-center gap-2 cursor-pointer shadow-md">
                <Upload className="w-4 h-4" />
                Select CSV File
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-300 font-medium">or paste CSV raw text below</span>
            </div>

            <button
              onClick={handleDownloadSampleTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300" />
              Download Sample CSV
            </button>
          </div>

          {/* Raw Text Input */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              CSV Data Stream
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                validateCSVContent(e.target.value);
              }}
              placeholder="Paste comma-separated performance data here..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
            ></textarea>
          </div>

          {/* Validation Summary Box (Prompt 26) */}
          {parsedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-750 text-center">
                  <span className="text-[10px] text-slate-300 uppercase font-bold">Total Rows</span>
                  <p className="text-xl font-black text-white mt-0.5">{parsedResult.summary.totalRows}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-center">
                  <span className="text-[10px] text-emerald-300 uppercase font-bold">Valid Records</span>
                  <p className="text-xl font-black text-emerald-300 mt-0.5">{parsedResult.summary.validCount}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/50 text-center">
                  <span className="text-[10px] text-amber-300 uppercase font-bold">Auto Zero-Filled</span>
                  <p className="text-xl font-black text-amber-300 mt-0.5">{parsedResult.missingConvertedCount}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-center">
                  <span className="text-[10px] text-rose-300 uppercase font-bold">Invalid / Errors</span>
                  <p className="text-xl font-black text-rose-300 mt-0.5">{parsedResult.summary.invalidCount}</p>
                </div>
              </div>

              {/* Invalid Rows Warning */}
              {parsedResult.invalidRows.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Errors Encountered in CSV:</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-rose-200 list-disc list-inside font-medium">
                    {parsedResult.invalidRows.slice(0, 5).map((err, idx) => (
                      <li key={idx}>
                        Row {err.rowNumber}: {err.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Valid Records */}
              {parsedResult.validRecords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Ready to Import ({parsedResult.validRecords.length} records):
                  </h4>
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-750 bg-slate-950 p-2 space-y-1">
                    {parsedResult.validRecords.slice(0, 8).map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                      >
                        <span className="font-bold text-white">
                          {rec.userName} <span className="text-orange-300 font-medium">({rec.weekName} {rec.month})</span>
                        </span>
                        <div className="flex gap-3 text-[11px] font-medium">
                          <span className="text-emerald-300 font-bold">Rev: ${rec.revenueGenerated}</span>
                          <span className="text-slate-300">Projects: {rec.projectClosed}</span>
                          <span className="text-cyan-300">Upsells: {rec.upsells}</span>
                          <span className="text-amber-300">Rating: {rec.clientRating}★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-750">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCommitImport}
              disabled={
                !parsedResult || parsedResult.validRecords.length === 0 || isProcessing
              }
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg cursor-pointer ${
                parsedResult && parsedResult.validRecords.length > 0 && !isProcessing
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/30'
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Save className="w-4 h-4" />
              {isProcessing ? 'Importing Data...' : `Commit Import (${parsedResult?.validRecords.length || 0} Records)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
