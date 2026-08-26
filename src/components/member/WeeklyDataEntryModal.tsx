import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  X,
  Save,
  Calculator,
  AlertCircle,
  Briefcase,
  DollarSign,
  TrendingUp,
  Star,
  Users,
  Repeat,
  FileText,
  Lock,
  Sparkles,
} from 'lucide-react';
import { PerformanceRecord } from '../../types';
import {
  calculateAchievementPercentage,
  calculateKPIScore,
  sanitizeNumber,
} from '../../services/calculationService';

export const WeeklyDataEntryModal: React.FC = () => {
  const { currentUser, allUsers, isAdmin, isSuperAdmin } = useAuth();
  const {
    isDataEntryModalOpen,
    closeDataEntryModal,
    editingRecord,
    targetPeriodIdForEntry,
    periods,
    kpis,
    settings,
    savePerformanceRecord,
    isPeriodLocked,
    selectedMonth,
    selectedYear,
  } = useApp();

  // Form State
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [projectClosed, setProjectClosed] = useState<string>('');
  const [revenueGenerated, setRevenueGenerated] = useState<string>('');
  const [upsells, setUpsells] = useState<string>('');
  const [clientRating, setClientRating] = useState<string>('');
  const [followupsCompleted, setFollowupsCompleted] = useState<string>('');
  const [repeatClients, setRepeatClients] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize or reset form values
  useEffect(() => {
    if (isDataEntryModalOpen) {
      if (editingRecord) {
        setSelectedUserId(editingRecord.userId);
        setSelectedPeriodId(editingRecord.periodId);
        setProjectClosed(editingRecord.projectClosed.toString());
        setRevenueGenerated(editingRecord.revenueGenerated.toString());
        setUpsells(editingRecord.upsells.toString());
        setClientRating(editingRecord.clientRating.toString());
        setFollowupsCompleted(editingRecord.followupsCompleted.toString());
        setRepeatClients(editingRecord.repeatClients.toString());
        setNotes(editingRecord.notes || '');
      } else {
        // New record
        setSelectedUserId(currentUser?.uid || '');
        const matchingPeriod = targetPeriodIdForEntry
          ? periods.find((p) => p.id === targetPeriodIdForEntry)
          : periods.find((p) => p.month === selectedMonth && p.year === selectedYear) ||
            periods[0];

        setSelectedPeriodId(matchingPeriod?.id || (periods.length > 0 ? periods[0].id : ''));
        setProjectClosed('');
        setRevenueGenerated('');
        setUpsells('');
        setClientRating('');
        setFollowupsCompleted('');
        setRepeatClients('');
        setNotes('');
      }
      setValidationError(null);
    }
  }, [isDataEntryModalOpen, editingRecord, targetPeriodIdForEntry, currentUser, periods, selectedMonth, selectedYear]);

  // Active period object
  const currentPeriod = periods.find((p) => p.id === selectedPeriodId);
  const isLocked = currentPeriod?.status === 'locked' && !isSuperAdmin;

  // Selected Target User (Only Super Admin can log/edit on behalf of other members)
  const targetUser = isSuperAdmin
    ? allUsers.find((u) => u.uid === selectedUserId || u.userId === selectedUserId) || currentUser
    : currentUser;

  // Live Score Calculation
  const liveCalculations = useMemo(() => {
    const rawProjects = sanitizeNumber(projectClosed);
    const rawRevenue = sanitizeNumber(revenueGenerated);
    const rawUpsells = sanitizeNumber(upsells);
    const rawRating = sanitizeNumber(clientRating, true);
    const rawFollowups = sanitizeNumber(followupsCompleted);
    const rawRepeat = sanitizeNumber(repeatClients);

    let totalScore = 0;
    const details: Record<string, { ach: number; score: number; target: number; weight: number }> = {};

    kpis.filter((k) => k.active).forEach((kpi) => {
      let val = 0;
      switch (kpi.key) {
        case 'projectClosed':
          val = rawProjects;
          break;
        case 'revenueGenerated':
          val = rawRevenue;
          break;
        case 'upsells':
          val = rawUpsells;
          break;
        case 'clientRating':
          val = rawRating;
          break;
        case 'followupsCompleted':
          val = rawFollowups;
          break;
        case 'repeatClients':
          val = rawRepeat;
          break;
      }
      const { capped } = calculateAchievementPercentage(val, kpi.defaultTarget, settings.achievementCap);
      const score = calculateKPIScore(capped, kpi.weight);
      totalScore += score;
      details[kpi.key] = { ach: capped, score, target: kpi.defaultTarget, weight: kpi.weight };
    });

    return {
      totalScore,
      totalScoreDisplay: totalScore.toFixed(settings.scoreDecimalPlaces || 2),
      details,
    };
  }, [projectClosed, revenueGenerated, upsells, clientRating, followupsCompleted, repeatClients, kpis, settings]);

  if (!isDataEntryModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedPeriodId) {
      setValidationError('Please select a valid performance period/week.');
      return;
    }

    if (!targetUser) {
      setValidationError('Please select a team member.');
      return;
    }

    if (isLocked) {
      setValidationError('This period is locked. Modifications are disabled.');
      return;
    }

    // Rating validation
    const numRating = sanitizeNumber(clientRating, true);
    if (clientRating !== '' && (numRating < 0 || numRating > 5)) {
      setValidationError('Client rating must be between 0.0 and 5.0');
      return;
    }

    setIsSubmitting(true);

    const record: PerformanceRecord = {
      id: editingRecord?.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: targetUser.uid,
      userName: targetUser.name,
      periodId: selectedPeriodId,
      month: currentPeriod?.month || selectedMonth,
      year: currentPeriod?.year || selectedYear,
      weekName: currentPeriod?.weekName || 'Week 1',
      // Blank automatically becomes 0 via sanitizeNumber
      projectClosed: sanitizeNumber(projectClosed),
      revenueGenerated: sanitizeNumber(revenueGenerated),
      upsells: sanitizeNumber(upsells),
      clientRating: sanitizeNumber(clientRating, true),
      followupsCompleted: sanitizeNumber(followupsCompleted),
      repeatClients: sanitizeNumber(repeatClients),
      notes: notes.trim(),
      submittedBy: currentUser?.userId || currentUser?.email || 'member',
      createdAt: editingRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const success = await savePerformanceRecord(record);
    setIsSubmitting(false);

    if (success) {
      closeDataEntryModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingRecord ? 'Edit Weekly Performance' : 'Log Weekly Performance'}
              </h2>
              <p className="text-xs text-slate-400">
                IT SMM Tigers KPI Performance Entry (Empty values default to 0)
              </p>
            </div>
          </div>

          <button
            onClick={closeDataEntryModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {validationError && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {isLocked && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <Lock className="w-4 h-4 shrink-0" />
              <span>This period has been locked by Super Admin. Read-only mode.</span>
            </div>
          )}

          {/* Period & Member Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team Member Selection (Super Admin only or locked for Member) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Team Member
              </label>
              {isSuperAdmin ? (
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={!!editingRecord}
                  aria-label="Select Team Member"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {allUsers
                    .filter((u) => u.status === 'active')
                    .map((user) => (
                      <option key={user.uid} value={user.uid}>
                        {user.name} ({user.userId})
                      </option>
                    ))}
                </select>
              ) : (
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white flex items-center justify-between">
                  <span>{currentUser?.name}</span>
                  <span className="text-[11px] font-mono text-orange-400 font-medium">({currentUser?.userId})</span>
                </div>
              )}
            </div>

            {/* Performance Period / Week Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Performance Period / Week
              </label>
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                disabled={!!editingRecord}
                aria-label="Select Performance Period"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.month} {p.year} - {p.weekName} {p.status === 'locked' ? '🔒 (Locked)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* KPI Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project Closed */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-orange-400" />
                  Project Closed
                </span>
                <span className="text-[10px] text-slate-500">Weight: 20% | Target: 25</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={isLocked}
                placeholder="Enter number (e.g. 4)"
                value={projectClosed}
                onChange={(e) => setProjectClosed(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Revenue Generated */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Revenue Generated ($)
                </span>
                <span className="text-[10px] text-slate-500">Weight: 30% | Target: $10,000</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                disabled={isLocked}
                placeholder="Enter amount (e.g. 1500)"
                value={revenueGenerated}
                onChange={(e) => setRevenueGenerated(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Upsells */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  Upsells
                </span>
                <span className="text-[10px] text-slate-500">Weight: 15% | Target: 10</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={isLocked}
                placeholder="Enter number (e.g. 2)"
                value={upsells}
                onChange={(e) => setUpsells(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-cyan-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Client Rating (0 to 5) */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Client Rating (0 - 5.0)
                </span>
                <span className="text-[10px] text-slate-500">Weight: 10% | Target: 5.0</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  disabled={isLocked}
                  placeholder="Enter rating (e.g. 5.0)"
                  value={clientRating}
                  onChange={(e) => setClientRating(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <div className="flex gap-1">
                  {[5, 4, 3].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setClientRating(r.toString())}
                      className="px-2 py-1 bg-slate-800 hover:bg-amber-500/20 text-amber-300 rounded text-xs font-bold"
                    >
                      {r}★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Follow-up Completed */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  Follow-up Completed
                </span>
                <span className="text-[10px] text-slate-500">Weight: 10% | Target: 50</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={isLocked}
                placeholder="Enter number (e.g. 15)"
                value={followupsCompleted}
                onChange={(e) => setFollowupsCompleted(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-purple-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Repeat Clients */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-pink-400" />
                  Repeat Clients
                </span>
                <span className="text-[10px] text-slate-500">Weight: 15% | Target: 10</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={isLocked}
                placeholder="Enter number (e.g. 2)"
                value={repeatClients}
                onChange={(e) => setRepeatClients(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-pink-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Notes / Highlights */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Notes / Campaign Highlights (Optional)
            </label>
            <input
              type="text"
              disabled={isLocked}
              placeholder="e.g. Major retainer renewal, Instagram influencer package closed"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Live Preview Score Estimation Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 via-slate-950 to-amber-950/40 border border-orange-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Estimated Weekly Score Preview
                </span>
                <span className="text-[10px] text-slate-400">
                  Calculated against benchmark KPI weights
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-amber-400">
                {liveCalculations.totalScoreDisplay}
              </span>
              <span className="text-xs font-bold text-slate-500"> / 100 PTS</span>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeDataEntryModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLocked || isSubmitting}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg cursor-pointer ${
                isLocked || isSubmitting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/30'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : editingRecord ? 'Update Record' : 'Save Performance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
