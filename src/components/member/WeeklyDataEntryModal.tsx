import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  CheckCircle,
  Clock,
} from 'lucide-react';
import { PerformanceRecord } from '../../types';
import {
  calculateAchievementPercentage,
  calculateKPIScore,
  sanitizeNumber,
} from '../../services/calculationService';
import { DataService } from '../../services/dataService';

export const WeeklyDataEntryModal: React.FC = () => {
  const { currentUser, allUsers, isAdmin, isSuperAdmin } = useAuth();
  const {
    isDataEntryModalOpen,
    closeDataEntryModal,
    editingRecord,
    targetPeriodIdForEntry,
    periods,
    records,
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
  const [activeExistingRecord, setActiveExistingRecord] = useState<PerformanceRecord | null>(null);
  const [isCheckingRecord, setIsCheckingRecord] = useState<boolean>(false);

  const [projectClosed, setProjectClosed] = useState<string>('');
  const [revenueGenerated, setRevenueGenerated] = useState<string>('');
  const [upsells, setUpsells] = useState<string>('');
  const [clientRating, setClientRating] = useState<string>('');
  const [followupsCompleted, setFollowupsCompleted] = useState<string>('');
  const [repeatClients, setRepeatClients] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const lastSyncKey = useRef<string>('');

  // Helpers to set form values
  const populateFromRecord = useCallback((rec: PerformanceRecord) => {
    setActiveExistingRecord(rec);
    setProjectClosed(rec.projectClosed !== undefined ? rec.projectClosed.toString() : '');
    setRevenueGenerated(rec.revenueGenerated !== undefined ? rec.revenueGenerated.toString() : '');
    setUpsells(rec.upsells !== undefined ? rec.upsells.toString() : '');
    setClientRating(rec.clientRating !== undefined ? rec.clientRating.toString() : '');
    setFollowupsCompleted(rec.followupsCompleted !== undefined ? rec.followupsCompleted.toString() : '');
    setRepeatClients(rec.repeatClients !== undefined ? rec.repeatClients.toString() : '');
    setNotes(rec.notes || '');
  }, []);

  const clearFormFields = useCallback(() => {
    setActiveExistingRecord(null);
    setProjectClosed('');
    setRevenueGenerated('');
    setUpsells('');
    setClientRating('');
    setFollowupsCompleted('');
    setRepeatClients('');
    setNotes('');
  }, []);

  // Check database/records for existing weekly performance entry
  const checkExistingRecord = useCallback(
    async (userId: string, periodId: string) => {
      if (!userId || !periodId) {
        clearFormFields();
        return;
      }

      const syncKey = `${userId}_${periodId}`;
      lastSyncKey.current = syncKey;

      const targetPeriod = periods.find((p) => p.id === periodId);
      const targetUserObj = allUsers.find((u) => u.uid === userId || u.userId === userId) || (currentUser?.uid === userId ? currentUser : null);
      const candidateUserIds = [userId, targetUserObj?.uid, targetUserObj?.userId].filter(Boolean).map((id) => String(id).toLowerCase());

      // 1. Fast local records check
      const localMatch = records.find((r) => {
        const rUid = String(r.userId || '').trim().toLowerCase();
        const rName = String(r.userName || '').trim().toLowerCase();
        const userMatches = candidateUserIds.includes(rUid) || (Boolean(targetUserObj?.name && rName) && rName === targetUserObj.name.toLowerCase());
        if (!userMatches) return false;

        const rPeriodId = String(r.periodId || '').trim().toLowerCase();
        const periodIdMatches = rPeriodId === periodId.toLowerCase();
        const periodContextMatches = Boolean(
          targetPeriod &&
          r.month &&
          r.year &&
          r.weekName &&
          r.month.toLowerCase() === targetPeriod.month.toLowerCase() &&
          Number(r.year) === Number(targetPeriod.year) &&
          r.weekName.toLowerCase() === targetPeriod.weekName.toLowerCase()
        );

        return periodIdMatches || periodContextMatches;
      });

      if (localMatch) {
        populateFromRecord(localMatch);
        return;
      }

      // 2. Direct backend database query
      setIsCheckingRecord(true);
      try {
        const dbMatch = await DataService.findExistingRecord(
          candidateUserIds,
          periodId,
          targetPeriod
            ? { month: targetPeriod.month, year: targetPeriod.year, weekName: targetPeriod.weekName }
            : undefined,
          targetUserObj?.name,
          targetUserObj?.profileCode
        );

        if (lastSyncKey.current === syncKey) {
          if (dbMatch) {
            populateFromRecord(dbMatch);
          } else {
            clearFormFields();
          }
        }
      } catch (err) {
        console.warn('Error checking existing performance record:', err);
        if (lastSyncKey.current === syncKey) {
          clearFormFields();
        }
      } finally {
        if (lastSyncKey.current === syncKey) {
          setIsCheckingRecord(false);
        }
      }
    },
    [periods, allUsers, currentUser, records, populateFromRecord, clearFormFields]
  );

  // Initialize form when modal opens
  useEffect(() => {
    if (isDataEntryModalOpen) {
      setValidationError(null);
      if (editingRecord) {
        setSelectedUserId(editingRecord.userId);
        setSelectedPeriodId(editingRecord.periodId);
        populateFromRecord(editingRecord);
        lastSyncKey.current = `${editingRecord.userId}_${editingRecord.periodId}`;
      } else {
        const initialUserId = currentUser?.uid || '';
        const matchingPeriod = targetPeriodIdForEntry
          ? periods.find((p) => p.id === targetPeriodIdForEntry)
          : periods.find((p) => p.month === selectedMonth && p.year === selectedYear) ||
            periods[0];
        const initialPeriodId = matchingPeriod?.id || (periods.length > 0 ? periods[0].id : '');

        setSelectedUserId(initialUserId);
        setSelectedPeriodId(initialPeriodId);

        if (initialUserId && initialPeriodId) {
          checkExistingRecord(initialUserId, initialPeriodId);
        } else {
          clearFormFields();
        }
      }
    } else {
      lastSyncKey.current = '';
      setActiveExistingRecord(null);
    }
  }, [
    isDataEntryModalOpen,
    editingRecord,
    targetPeriodIdForEntry,
    currentUser,
    periods,
    selectedMonth,
    selectedYear,
    populateFromRecord,
    clearFormFields,
    checkExistingRecord,
  ]);

  const handleUserChange = (newUserId: string) => {
    setSelectedUserId(newUserId);
    setValidationError(null);
    if (newUserId && selectedPeriodId) {
      checkExistingRecord(newUserId, selectedPeriodId);
    }
  };

  const handlePeriodChange = (newPeriodId: string) => {
    setSelectedPeriodId(newPeriodId);
    setValidationError(null);
    if (selectedUserId && newPeriodId) {
      checkExistingRecord(selectedUserId, newPeriodId);
    }
  };

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

    const targetRecordId = activeExistingRecord?.id || editingRecord?.id;
    const record: PerformanceRecord = {
      id: targetRecordId || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: targetUser.uid,
      userName: targetUser.name,
      periodId: selectedPeriodId,
      month: currentPeriod?.month || selectedMonth,
      year: currentPeriod?.year || selectedYear,
      weekName: currentPeriod?.weekName || 'Week 1',
      profileCode: targetUser.profileCode || activeExistingRecord?.profileCode || editingRecord?.profileCode || 'PR',
      // Blank automatically becomes 0 via sanitizeNumber
      projectClosed: sanitizeNumber(projectClosed),
      revenueGenerated: sanitizeNumber(revenueGenerated),
      upsells: sanitizeNumber(upsells),
      clientRating: sanitizeNumber(clientRating, true),
      followupsCompleted: sanitizeNumber(followupsCompleted),
      repeatClients: sanitizeNumber(repeatClients),
      notes: notes.trim(),
      submittedBy: currentUser?.userId || currentUser?.email || 'member',
      createdAt: activeExistingRecord?.createdAt || editingRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const success = await savePerformanceRecord(record);
    setIsSubmitting(false);

    if (success) {
      closeDataEntryModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={closeDataEntryModal}
    >
      <div
        className="relative w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-slate-900 border border-slate-750 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-slate-750 bg-slate-950 z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              activeExistingRecord
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
            }`}>
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {activeExistingRecord ? 'Edit Weekly Performance' : 'Log Weekly Performance'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                IT SMM Tigers KPI Performance Entry (Empty values default to 0)
              </p>
            </div>
          </div>

          <button
            onClick={closeDataEntryModal}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container with scrollable body and pinned footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
            {validationError && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                <span>{validationError}</span>
              </div>
            )}

            {isLocked && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold">
                <Lock className="w-4 h-4 shrink-0 text-amber-300" />
                <span>This period has been locked by Super Admin. Read-only mode.</span>
              </div>
            )}

          {/* Period & Member Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team Member Selection (Super Admin only or locked for Member) */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                Team Member
              </label>
              {isSuperAdmin ? (
                <select
                  value={selectedUserId}
                  onChange={(e) => handleUserChange(e.target.value)}
                  aria-label="Select Team Member"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                <div className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white flex items-center justify-between">
                  <span>{currentUser?.name}</span>
                  <span className="text-[11px] font-mono text-orange-300 font-bold">({currentUser?.userId})</span>
                </div>
              )}
            </div>

            {/* Performance Period / Week Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                Performance Period / Week
              </label>
              <select
                value={selectedPeriodId || ''}
                onChange={(e) => handlePeriodChange(e.target.value)}
                aria-label="Select Performance Period"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {periods.map((p) => {
                  const hasData = records.some((r) => {
                    const rUid = String(r.userId || '').trim().toLowerCase();
                    const userMatches = (targetUser?.uid && rUid === targetUser.uid.toLowerCase()) || (targetUser?.userId && rUid === targetUser.userId.toLowerCase());
                    const periodMatches = String(r.periodId || '').toLowerCase() === p.id.toLowerCase() ||
                      (r.month?.toLowerCase() === p.month.toLowerCase() && Number(r.year) === Number(p.year) && r.weekName?.toLowerCase() === p.weekName.toLowerCase());
                    return userMatches && periodMatches;
                  });
                  const dateRange = p.startDate && p.endDate ? ` (${p.startDate} – ${p.endDate})` : '';
                  return (
                    <option key={p.id} value={p.id}>
                      {p.weekName} - {p.month} {p.year}{dateRange} {hasData ? '• [Existing Data]' : ''} {p.status === 'locked' ? '🔒 (Locked)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Existing Performance Detection Banner */}
          {activeExistingRecord ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 text-emerald-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-emerald-300">Existing Performance Found</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/25 text-emerald-200 font-mono font-bold">
                        ID: {activeExistingRecord.id}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/85 mt-1">
                      Existing weekly performance data for <strong className="text-white">{activeExistingRecord.userName}</strong> ({currentPeriod?.weekName || activeExistingRecord.weekName}) is loaded below. You can edit any values and click &quot;Edit Performance&quot; to update this record without creating duplicates.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 self-start sm:self-center shrink-0">
                  Edit / Update Mode
                </span>
              </div>
            </div>
          ) : isCheckingRecord ? (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 flex items-center gap-2 text-xs">
              <Clock className="w-4 h-4 text-orange-400 animate-spin" />
              <span>Checking database for existing weekly performance...</span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-medium text-slate-300">
                    No existing record found for this week — ready for new entry.
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-800 text-slate-400">
                  New Entry
                </span>
              </div>
            </div>
          )}

          {/* KPI Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project Closed */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-750 space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-orange-300" />
                  Project Closed
                </span>
                <span className="text-[10px] text-slate-300 font-semibold">Weight: 20% | Target: 25</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={isLocked}
                placeholder="Enter number (e.g. 4)"
                value={projectClosed || ''}
                onChange={(e) => setProjectClosed(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Revenue Generated */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-750 space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
                  Revenue Generated ($)
                </span>
                <span className="text-[10px] text-slate-300 font-semibold">Weight: 30% | Target: $10,000</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                disabled={isLocked}
                placeholder="Enter amount (e.g. 1500)"
                value={revenueGenerated || ''}
                onChange={(e) => setRevenueGenerated(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Upsells */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-750 space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-300" />
                  Upsells
                </span>
                <span className="text-[10px] text-slate-300 font-semibold">Weight: 15% | Target: 10</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={isLocked}
                placeholder="Enter number (e.g. 2)"
                value={upsells || ''}
                onChange={(e) => setUpsells(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-cyan-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Client Rating (0 to 5) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-750 space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  Client Rating (0 - 5.0)
                </span>
                <span className="text-[10px] text-slate-300 font-semibold">Weight: 10% | Target: 5.0</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  disabled={isLocked}
                  placeholder="Enter rating (e.g. 5.0)"
                  value={clientRating || ''}
                  onChange={(e) => setClientRating(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-amber-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <div className="flex gap-1">
                  {[5, 4, 3].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setClientRating(r.toString())}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500/20 text-amber-300 border border-slate-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      {r}★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Follow-up Completed */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-750 space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-300" />
                  Follow-up Completed
                </span>
                <span className="text-[10px] text-slate-300 font-semibold">Weight: 10% | Target: 50</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={isLocked}
                placeholder="Enter number (e.g. 15)"
                value={followupsCompleted || ''}
                onChange={(e) => setFollowupsCompleted(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-purple-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Repeat Clients */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-750 space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-pink-300" />
                  Repeat Clients
                </span>
                <span className="text-[10px] text-slate-300 font-semibold">Weight: 15% | Target: 10</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={isLocked}
                placeholder="Enter number (e.g. 2)"
                value={repeatClients || ''}
                onChange={(e) => setRepeatClients(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-pink-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Notes / Highlights */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Notes / Campaign Highlights (Optional)
            </label>
            <input
              type="text"
              disabled={isLocked}
              placeholder="e.g. Major retainer renewal, Instagram influencer package closed"
              value={notes || ''}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Live Preview Score Estimation Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/50 via-slate-950 to-amber-950/50 border border-orange-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-orange-300" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Estimated Weekly Score Preview
                </span>
                <span className="text-[10px] text-slate-300 font-medium">
                  Calculated against benchmark KPI weights
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-amber-300">
                {liveCalculations.totalScoreDisplay}
              </span>
              <span className="text-xs font-bold text-slate-400"> / 100 PTS</span>
            </div>
          </div>
          </div>

          {/* Modal Footer Buttons (Pinned) */}
          <div className="flex-shrink-0 flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-750 bg-slate-950 z-10">
            <button
              type="button"
              onClick={closeDataEntryModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLocked || isSubmitting}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg cursor-pointer ${
                isLocked || isSubmitting
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  : activeExistingRecord
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/30'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSubmitting
                ? 'Saving...'
                : activeExistingRecord
                ? 'Edit Performance'
                : 'Add Performance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
