import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sliders,
  Save,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  DollarSign,
  Percent,
  Target,
  RefreshCw,
} from 'lucide-react';
import { KPIConfig, AppSettings } from '../../types';
import { validateKPIWeights, DEFAULT_KPIS, DEFAULT_SETTINGS } from '../../services/calculationService';

export const KPISettings: React.FC = () => {
  const { kpis, settings, saveKPIConfig, saveAppSettings, addToast } = useApp();

  const [localKpis, setLocalKpis] = useState<KPIConfig[]>(kpis);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    setLocalKpis(kpis);
    setLocalSettings(settings);
  }, [kpis, settings]);

  const validation = validateKPIWeights(localKpis);

  const handleWeightChange = (id: string, newWeight: number) => {
    setLocalKpis((prev) =>
      prev.map((k) => (k.id === id ? { ...k, weight: Math.max(0, newWeight) } : k))
    );
    setErrorMessage(null);
  };

  const handleTargetChange = (id: string, newTarget: number) => {
    setLocalKpis((prev) =>
      prev.map((k) => (k.id === id ? { ...k, defaultTarget: Math.max(0, newTarget) } : k))
    );
  };

  const handleNameChange = (id: string, newName: string) => {
    setLocalKpis((prev) =>
      prev.map((k) => (k.id === id ? { ...k, name: newName } : k))
    );
  };

  const handleToggleActive = (id: string) => {
    setLocalKpis((prev) =>
      prev.map((k) => (k.id === id ? { ...k, active: !k.active } : k))
    );
    setErrorMessage(null);
  };

  const handleResetDefaults = () => {
    setLocalKpis(DEFAULT_KPIS);
    setLocalSettings(DEFAULT_SETTINGS);
    setErrorMessage(null);
    addToast('info', 'Reset to Factory Defaults', 'Click "Save Changes" to commit.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const val = validateKPIWeights(localKpis);
    if (!val.isValid) {
      setErrorMessage('Total KPI weight must equal 100%.');
      addToast('error', 'Validation Error', 'Total KPI weight must equal 100%.');
      return;
    }

    setIsSaving(true);
    const kpiRes = await saveKPIConfig(localKpis);
    if (!kpiRes.success) {
      setErrorMessage(kpiRes.message || 'Failed to save KPI weights.');
      setIsSaving(false);
      return;
    }

    await saveAppSettings(localSettings);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">KPI Structure & Weight Configuration</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure weighted performance metrics and target benchmarks (Must equal exactly 100%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Real-time Weight Total Status Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
          validation.isValid
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/50 text-rose-200 animate-pulse'
        }`}
      >
        <div className="flex items-center gap-3">
          {validation.isValid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <div>
            <span className="text-xs font-bold block">
              Current Total KPI Weight: <strong>{validation.totalWeight}%</strong> / 100%
            </span>
            <span className="text-[11px] opacity-80">
              {validation.isValid
                ? 'Valid distribution. All KPI scores will compute cleanly.'
                : 'Warning: Total KPI weight must equal 100% before you can save.'}
            </span>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            validation.isValid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
          }`}
        >
          {validation.isValid ? '✓ Valid (100%)' : `≠ ${validation.totalWeight}%`}
        </span>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            Active Performance KPIs
          </h3>

          <div className="space-y-3">
            {localKpis.map((kpi) => (
              <div
                key={kpi.id}
                className={`p-4 rounded-2xl border transition-all ${
                  kpi.active
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-slate-950/40 border-slate-800/40 opacity-60'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* KPI Name */}
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      KPI Name
                    </label>
                    <input
                      type="text"
                      value={kpi.name}
                      onChange={(e) => handleNameChange(kpi.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Weight % */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Weight (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={kpi.weight}
                        onChange={(e) => handleWeightChange(kpi.id, Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-7 py-2 text-xs font-black text-amber-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <Percent className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Benchmark Target */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Benchmark Target
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={kpi.defaultTarget}
                      onChange={(e) => handleTargetChange(kpi.id, Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(kpi.id)}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        kpi.active
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                      title={kpi.active ? 'Disable KPI' : 'Enable KPI'}
                    >
                      {kpi.active ? 'Active' : 'Off'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Scoring Settings */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            Global Scoring & Display Rules (Prompt 39)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Currency Symbol
              </label>
              <select
                value={localSettings.currencySymbol}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    currencySymbol: e.target.value,
                    currency: e.target.value === '$' ? 'USD' : e.target.value === '€' ? 'EUR' : 'INR',
                  })
                }
                aria-label="Select Currency Symbol"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="₹">INR (₹)</option>
                <option value="AED">AED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Score Display Decimals
              </label>
              <select
                value={localSettings.scoreDecimalPlaces}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    scoreDecimalPlaces: Number(e.target.value),
                  })
                }
                aria-label="Select Score Display Decimals"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value={2}>2 Decimal Places (Standard, e.g. 68.02)</option>
                <option value={1}>1 Decimal Place (e.g. 68.0)</option>
                <option value={0}>0 Decimal Places (Rounded Integer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Max Achievement Cap (%)
              </label>
              <input
                type="number"
                min="50"
                max="200"
                value={localSettings.achievementCap}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    achievementCap: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard cap is 100% to prevent over-weighting
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={!validation.isValid || isSaving}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all shadow-lg cursor-pointer ${
              validation.isValid && !isSaving
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Changes...' : 'Save KPI Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
