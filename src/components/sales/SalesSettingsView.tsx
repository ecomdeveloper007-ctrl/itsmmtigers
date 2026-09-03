import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import {
  SalesRewardSettings,
  SalesProfileCode,
  SalesProfileTargetConfig,
  SalesRewardSlab,
  SALES_PROFILES_META,
} from '../../types/sales';
import {
  validateSalesProfileConfig,
  DEFAULT_SALES_SETTINGS,
  DEFAULT_REWARD_SLABS,
} from '../../services/salesCalculationService';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  ShieldCheck,
  Building,
  Sparkles,
} from 'lucide-react';

export const SalesSettingsView: React.FC = () => {
  const { salesSettings, saveSalesRewardSettings, resetSalesRewardSettings } = useSales();

  const [activeProfileTab, setActiveProfileTab] = useState<SalesProfileCode>('PR');
  const [formData, setFormData] = useState<SalesRewardSettings>(JSON.parse(JSON.stringify(salesSettings)));
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const currentConfig: SalesProfileTargetConfig =
    formData.profiles[activeProfileTab] || DEFAULT_SALES_SETTINGS.profiles[activeProfileTab];

  // Update specific field in active profile
  const handleProfileFieldChange = (field: keyof SalesProfileTargetConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      profiles: {
        ...prev.profiles,
        [activeProfileTab]: {
          ...prev.profiles[activeProfileTab],
          [field]: value,
        },
      },
    }));
    setSaveSuccessMsg('');
  };

  // Update reward slab in active profile
  const handleSlabChange = (index: number, field: keyof SalesRewardSlab, value: any) => {
    const updatedSlabs = [...(currentConfig.rewardSlabs || DEFAULT_REWARD_SLABS)];
    updatedSlabs[index] = {
      ...updatedSlabs[index],
      [field]: value,
    };
    handleProfileFieldChange('rewardSlabs', updatedSlabs);
  };

  // Add new reward slab
  const handleAddSlab = () => {
    const updatedSlabs = [
      ...(currentConfig.rewardSlabs || DEFAULT_REWARD_SLABS),
      {
        id: `slab_${Date.now()}`,
        level: 'Custom Tier',
        minScore: 50,
        maxScore: 59.99,
        rewardAmount: 500,
        color: 'text-gray-700 bg-gray-50 border-gray-200',
      },
    ];
    handleProfileFieldChange('rewardSlabs', updatedSlabs);
  };

  // Delete reward slab
  const handleDeleteSlab = (index: number) => {
    const updatedSlabs = (currentConfig.rewardSlabs || DEFAULT_REWARD_SLABS).filter((_, i) => i !== index);
    handleProfileFieldChange('rewardSlabs', updatedSlabs);
  };

  const currentWeightSum =
    (Number(currentConfig.conversionWeight ?? currentConfig.orderConvertWeight) || 0) +
    (Number(currentConfig.followupsWeight ?? currentConfig.followupWeight) || 0) +
    (Number(currentConfig.orderValueWeight) || 0);

  const handleSave = async () => {
    setValidationErrors([]);
    setSaveSuccessMsg('');

    // Validate all profiles
    const allErrors: string[] = [];
    const codes: SalesProfileCode[] = ['PR', 'WR', 'HW', 'DR', 'RR'];

    for (const code of codes) {
      const cfg = formData.profiles[code];
      if (cfg) {
        const val = validateSalesProfileConfig(cfg);
        if (!val.isValid) {
          allErrors.push(`[${code} Profile]: ${val.errors.join(' ')}`);
        }
      }
    }

    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      return;
    }

    setIsSaving(true);
    const ok = await saveSalesRewardSettings(formData);
    setIsSaving(false);
    if (ok) {
      setSaveSuccessMsg('Sales targets, weights, and reward slabs successfully saved and recalibrated!');
    }
  };

  const handleReset = async () => {
    if (confirm('Reset all sales targets, weights, and reward slabs to standard defaults?')) {
      setIsSaving(true);
      await resetSalesRewardSettings();
      setFormData(JSON.parse(JSON.stringify(DEFAULT_SALES_SETTINGS)));
      setIsSaving(false);
      setSaveSuccessMsg('Settings reset to default.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
              Admin Configuration
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • Profile-Specific Targets & 50/20/30 Weights
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1">
            Sales Target & Reward Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            Configure profile-specific targets, weights (Conversion 50%, Follow-ups 20%, Order Value 30%), and reward tiers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-bold text-xs border border-[#e2ebd9] transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#598327]" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-2xl bg-[#8cc540] hover:bg-[#7db734] text-[#101010] font-black text-xs shadow-md shadow-[#8cc540]/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
          <div className="flex items-center gap-2 font-black">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Validation Issues Detected:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Global Currency Setting */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-5 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-black text-[#101010] uppercase tracking-wider">
            Currency & Display Symbol
          </h3>
          <p className="text-xs text-[#666666]">
            Select monetary symbol displayed across Sales Leaderboard and Reward payouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFormData((prev) => ({ ...prev, currency: 'USD', currencySymbol: '$' }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
              formData.currencySymbol === '$'
                ? 'bg-[#8cc540] text-[#101010] border-[#8cc540]'
                : 'bg-[#f8faf6] text-[#555555] border-[#e2ebd9]'
            }`}
          >
            $ USD (Dollars)
          </button>
          <button
            onClick={() => setFormData((prev) => ({ ...prev, currency: 'INR', currencySymbol: '₹' }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
              formData.currencySymbol === '₹'
                ? 'bg-[#8cc540] text-[#101010] border-[#8cc540]'
                : 'bg-[#f8faf6] text-[#555555] border-[#e2ebd9]'
            }`}
          >
            ₹ INR (Rupees)
          </button>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['PR', 'WR', 'HW', 'DR', 'RR'] as SalesProfileCode[]).map((code) => {
          const meta = SALES_PROFILES_META[code];
          return (
            <button
              key={code}
              onClick={() => setActiveProfileTab(code)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeProfileTab === code
                  ? 'bg-[#101010] text-white shadow-sm'
                  : 'bg-white text-[#555555] border border-[#e2ebd9] hover:bg-[#f8faf6]'
              }`}
            >
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#8cc540] text-[#101010] font-black">
                {code}
              </span>
              <span>{meta.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Profile Configuration Form */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-4">
          <div>
            <h2 className="text-xl font-black text-[#101010]">
              {SALES_PROFILES_META[activeProfileTab].name} ({currentConfig.department} Sales)
            </h2>
            <p className="text-xs text-[#666666]">
              {SALES_PROFILES_META[activeProfileTab].description}
            </p>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-black border ${
              Math.abs(currentWeightSum - 100) < 0.01
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            Scoring Weights: {currentWeightSum}% {Math.abs(currentWeightSum - 100) < 0.01 ? '✓ Valid (100%)' : '⚠️ Must = 100%'}
          </div>
        </div>

        {/* 4 Performance Metric Target & Weight Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Reachouts (0% weight) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">1. Total Reachouts</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                0% Weight
              </span>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 block">Baseline Target Volume</label>
              <input
                type="number"
                min="1"
                value={currentConfig.reachoutTarget}
                onChange={(e) => handleProfileFieldChange('reachoutTarget', Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-black text-slate-800 focus:ring-2 focus:ring-slate-400 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Used purely as the denominator for conversion rate calculation.
            </p>
          </div>

          {/* 2. Conversion Rate (50% weight) */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950">2. Conversion Rate</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                50% Weight
              </span>
            </div>
            <div>
              <label className="text-[10px] font-bold text-emerald-800 block">Target Conversion Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={currentConfig.targetConversionRate ?? currentConfig.orderConvertTarget}
                onChange={(e) => handleProfileFieldChange('targetConversionRate', Number(e.target.value))}
                className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-black text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-emerald-800 block">Metric Weight (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={currentConfig.conversionWeight ?? currentConfig.orderConvertWeight ?? 50}
                onChange={(e) => {
                  handleProfileFieldChange('conversionWeight', Number(e.target.value));
                  handleProfileFieldChange('orderConvertWeight', Number(e.target.value));
                }}
                className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-black text-[#436320] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Follow-ups (20% weight) */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-950">3. Follow-ups Done</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-200 text-blue-900">
                20% Weight
              </span>
            </div>
            <div>
              <label className="text-[10px] font-bold text-blue-800 block">Target Follow-ups Count</label>
              <input
                type="number"
                min="1"
                value={currentConfig.targetFollowups ?? currentConfig.followupTarget}
                onChange={(e) => {
                  handleProfileFieldChange('targetFollowups', Number(e.target.value));
                  handleProfileFieldChange('followupTarget', Number(e.target.value));
                }}
                className="w-full bg-white border border-blue-300 rounded-xl px-3 py-1.5 text-xs font-black text-blue-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-blue-800 block">Metric Weight (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={currentConfig.followupsWeight ?? currentConfig.followupWeight ?? 20}
                onChange={(e) => {
                  handleProfileFieldChange('followupsWeight', Number(e.target.value));
                  handleProfileFieldChange('followupWeight', Number(e.target.value));
                }}
                className="w-full bg-white border border-blue-300 rounded-xl px-3 py-1.5 text-xs font-black text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Order Value (30% weight) */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950">4. Total Order Value ($)</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                30% Weight
              </span>
            </div>
            <div>
              <label className="text-[10px] font-bold text-amber-800 block">Target Order Value ($)</label>
              <input
                type="number"
                min="1"
                value={currentConfig.targetOrderValue ?? 10000}
                onChange={(e) => handleProfileFieldChange('targetOrderValue', Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-black text-amber-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-amber-800 block">Metric Weight (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={currentConfig.orderValueWeight ?? 30}
                onChange={(e) => handleProfileFieldChange('orderValueWeight', Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-black text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Minimum Conversion Rate Hurdle */}
        <div className="p-4 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black text-[#101010]">
              Minimum Conversion Rate Benchmark for Reward Eligibility
            </h3>
            <p className="text-xs text-[#666666]">
              Members achieving high overall score but falling below this conversion rate will be disqualified from monetary rewards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={currentConfig.minConversionRate}
              onChange={(e) => handleProfileFieldChange('minConversionRate', Number(e.target.value))}
              className="w-24 bg-white border border-[#e2ebd9] rounded-xl px-3 py-1.5 text-xs font-black text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none text-right"
            />
            <span className="text-xs font-black text-[#436320]">%</span>
          </div>
        </div>

        {/* Reward Slabs & Cash Amounts Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-[#101010] uppercase tracking-wider">
                Reward Slabs & Cash Payouts ({activeProfileTab} Profile)
              </h3>
              <p className="text-xs text-[#666666]">
                Configure min/max qualifying score bands and monetary reward amount
              </p>
            </div>
            <button
              onClick={handleAddSlab}
              className="text-xs font-bold text-[#436320] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Reward Slab
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#e2ebd9]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f8faf6] text-[#666666] font-bold uppercase text-[10px] border-b border-[#e2ebd9]">
                <tr>
                  <th className="p-3">Reward Level Name</th>
                  <th className="p-3 text-right">Min Score</th>
                  <th className="p-3 text-right">Max Score</th>
                  <th className="p-3 text-right">Reward Amount ({formData.currencySymbol})</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4ec]">
                {(currentConfig.rewardSlabs || DEFAULT_REWARD_SLABS).map((slab, idx) => (
                  <tr key={slab.id || idx}>
                    <td className="p-3">
                      <input
                        type="text"
                        value={slab.level}
                        onChange={(e) => handleSlabChange(idx, 'level', e.target.value)}
                        className="bg-[#f8faf6] border border-[#e2ebd9] rounded-lg px-2.5 py-1 text-xs font-black text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none w-44"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={slab.minScore}
                        onChange={(e) => handleSlabChange(idx, 'minScore', Number(e.target.value))}
                        className="bg-[#f8faf6] border border-[#e2ebd9] rounded-lg px-2.5 py-1 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none w-20 text-right"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={slab.maxScore}
                        onChange={(e) => handleSlabChange(idx, 'maxScore', Number(e.target.value))}
                        className="bg-[#f8faf6] border border-[#e2ebd9] rounded-lg px-2.5 py-1 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none w-20 text-right"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={slab.rewardAmount}
                        onChange={(e) => handleSlabChange(idx, 'rewardAmount', Number(e.target.value))}
                        className="bg-[#f8faf6] border border-[#e2ebd9] rounded-lg px-2.5 py-1 text-xs font-black text-[#436320] focus:ring-2 focus:ring-[#8cc540] focus:outline-none w-28 text-right"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteSlab(idx)}
                        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        title="Delete Slab"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
