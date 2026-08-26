import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { MemberPerformanceSummary, UserProfile } from '../../types';
import {
  X,
  Shield,
  User,
  Mail,
  Calendar,
  DollarSign,
  Briefcase,
  TrendingUp,
  Star,
  Users,
  Repeat,
  Trophy,
  CheckCircle2,
  Lock,
  Eye,
  KeyRound,
  ExternalLink,
  Award,
  Trash2,
  Edit,
} from 'lucide-react';

interface MemberProfileAdminModalProps {
  memberSummary?: MemberPerformanceSummary | null;
  userProfile?: UserProfile | null;
  onClose: () => void;
  onEditUser?: (user: UserProfile) => void;
}

export const MemberProfileAdminModal: React.FC<MemberProfileAdminModalProps> = ({
  memberSummary,
  userProfile,
  onClose,
  onEditUser,
}) => {
  const { isSuperAdmin, allUsers } = useAuth();
  const { selectedMonth, selectedYear, records, isPeriodLocked, deletePerformanceRecord, openDataEntryModal } = useApp();
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  if (!isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Access Restricted</h3>
          <p className="text-xs text-slate-400">
            Only Super Admin has authorization to inspect other team members' confidential profiles.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Resolve user profile & summary
  const targetUser: UserProfile | undefined =
    userProfile ||
    allUsers.find(
      (u) =>
        u.uid === memberSummary?.userId ||
        u.userId === memberSummary?.userId ||
        u.name === memberSummary?.userName
    );

  const memberRecords = records
    .filter(
      (r) =>
        (r.userId === targetUser?.uid ||
          r.userId === targetUser?.userId ||
          r.userId === memberSummary?.userId) &&
        r.month.toLowerCase() === selectedMonth.toLowerCase() &&
        r.year === selectedYear
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 space-y-0">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Member Confidential Profile</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Super Admin View
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audit inspect for {selectedMonth} {selectedYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Member Card Profile */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <img
              src={
                targetUser?.avatarUrl ||
                memberSummary?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={targetUser?.name || memberSummary?.userName || 'Member'}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-orange-500/40 shadow-lg"
            />
            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 className="text-base font-bold text-white">
                  {targetUser?.name || memberSummary?.userName}
                </h4>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                    (targetUser?.department?.includes('IT') || targetUser?.team === 'IT')
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                  }`}
                >
                  {targetUser?.department || memberSummary?.department || 'IT Team'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {targetUser?.role?.replace('_', ' ') || 'Team Member'}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-0.5 pt-1">
                <p className="flex items-center justify-center sm:justify-start gap-1.5 font-mono">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  User ID: <span className="text-orange-400 font-bold">{targetUser?.userId || memberSummary?.userId}</span>
                </p>
                <p className="flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {targetUser?.email || 'N/A'}
                </p>
                {targetUser?.joiningDate && (
                  <p className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Joined: {new Date(targetUser.joiningDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {targetUser && onEditUser && (
              <button
                onClick={() => {
                  onClose();
                  onEditUser(targetUser);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                Edit User
              </button>
            )}
          </div>

          {/* Performance Snapshot */}
          {memberSummary && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Performance Overview ({selectedMonth} {selectedYear})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Final Score</span>
                  <div className="text-xl font-black text-amber-400 mt-1">
                    {memberSummary.finalScoreDisplay} <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">{memberSummary.performanceBand}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Revenue</span>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    ${memberSummary.revenueGenerated.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500">Total generated</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Projects</span>
                  <div className="text-xl font-black text-orange-400 mt-1">
                    {memberSummary.projectClosed}
                  </div>
                  <span className="text-[10px] text-slate-500">Closed deals</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Leaderboard Rank</span>
                  <div className="text-xl font-black text-white mt-1">
                    #{memberSummary.rank}
                  </div>
                  <span className="text-[10px] text-slate-500">{memberSummary.weeksSubmitted} week(s) logged</span>
                </div>
              </div>
            </div>
          )}

          {/* Submitted Logs History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Weekly Logs in {selectedMonth} {selectedYear} ({memberRecords.length} entries)
            </h4>
            {memberRecords.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
                No weekly logs submitted for this period yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs bg-slate-950">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Period</th>
                      <th className="py-2.5 px-3">Revenue</th>
                      <th className="py-2.5 px-3">Projects</th>
                      <th className="py-2.5 px-3">Upsells</th>
                      <th className="py-2.5 px-3">Rating</th>
                      <th className="py-2.5 px-3">Follow-ups</th>
                      <th className="py-2.5 px-3">Repeat</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {memberRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 font-semibold text-white">{r.weekName}</td>
                        <td className="py-2 px-3 font-bold text-emerald-400">${r.revenueGenerated.toLocaleString()}</td>
                        <td className="py-2 px-3 font-semibold text-slate-300">{r.projectClosed}</td>
                        <td className="py-2 px-3 font-semibold text-cyan-400">{r.upsells}</td>
                        <td className="py-2 px-3 font-semibold text-amber-400">{r.clientRating.toFixed(1)} ★</td>
                        <td className="py-2 px-3">{r.followupsCompleted}</td>
                        <td className="py-2 px-3">{r.repeatClients}</td>
                        <td className="py-2 px-3 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => {
                              onClose();
                              openDataEntryModal(r, r.periodId);
                            }}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit Submission"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          {deleteConfirmId === r.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={async () => {
                                  await deletePerformanceRecord(r.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px]"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(r.id)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
