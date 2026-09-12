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
  Lock,
  Trash2,
  Edit,
} from 'lucide-react';

interface MemberProfileAdminModalProps {
  member?: UserProfile | null;
  memberSummary?: MemberPerformanceSummary | null;
  userProfile?: UserProfile | null;
  onClose: () => void;
  onEditUser?: (user: UserProfile) => void;
}

export const MemberProfileAdminModal: React.FC<MemberProfileAdminModalProps> = ({
  member,
  memberSummary,
  userProfile,
  onClose,
  onEditUser,
}) => {
  const { isSuperAdmin, allUsers } = useAuth();
  const { selectedMonth, selectedYear, records, deletePerformanceRecord, openDataEntryModal } = useApp();
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  if (!isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white border border-[#e2ebd9] rounded-3xl p-6 max-w-md text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#101010]">Access Restricted</h3>
          <p className="text-xs text-[#666666]">
            Only Super Admin has authorization to inspect other team members' confidential profiles.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#101010] text-white hover:bg-black cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Resolve user profile & summary
  const targetUser: UserProfile | undefined =
    member ||
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white border border-[#e2ebd9] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 space-y-0">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-[#e2ebd9] bg-[#f8faf6]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#101010]">Member Confidential Profile</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                  Super Admin View
                </span>
              </div>
              <p className="text-xs text-[#666666] mt-0.5">
                Audit inspect for {selectedMonth} {selectedYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#888888] hover:text-[#101010] hover:bg-[#edf3e7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Member Card Profile */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
            <img
              src={
                targetUser?.avatarUrl ||
                memberSummary?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={targetUser?.name || memberSummary?.userName || 'Member'}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#8cc540]/50 shadow-sm"
            />
            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 className="text-base font-black text-[#101010]">
                  {targetUser?.name || memberSummary?.userName}
                </h4>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                    targetUser?.department?.includes('IT') || targetUser?.team === 'IT'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}
                >
                  {targetUser?.department || memberSummary?.department || 'IT Team'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                  {targetUser?.role?.replace('_', ' ') || 'Team Member'}
                </span>
              </div>

              <div className="text-xs text-[#555555] space-y-0.5 pt-1">
                <p className="flex items-center justify-center sm:justify-start gap-1.5 font-mono">
                  <User className="w-3.5 h-3.5 text-[#888888]" />
                  <span className="text-[#666666]">User ID:</span>{' '}
                  <span className="text-[#101010] font-bold">{targetUser?.userId || memberSummary?.userId}</span>
                </p>
                <p className="flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#888888]" />
                  <span className="text-[#333333]">{targetUser?.email || 'N/A'}</span>
                </p>
                {targetUser?.joiningDate && (
                  <p className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                    <span className="text-[#666666]">Joined: {new Date(targetUser.joiningDate).toLocaleDateString()}</span>
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
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-[#f0f4ec] text-[#101010] border border-[#e2ebd9] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                Edit User
              </button>
            )}
          </div>

          {/* Performance Snapshot */}
          {memberSummary && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#101010] uppercase tracking-wider">
                Performance Overview ({selectedMonth} {selectedYear})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
                  <span className="text-[10px] font-bold text-[#666666] uppercase">Final Score</span>
                  <div className="text-xl font-black text-[#101010] mt-1">
                    {memberSummary.finalScoreDisplay} <span className="text-xs text-[#888888]">/ 100</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">{memberSummary.performanceBand}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
                  <span className="text-[10px] font-bold text-[#666666] uppercase">Revenue</span>
                  <div className="text-xl font-black text-emerald-700 mt-1">
                    ${memberSummary.revenueGenerated.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#888888] font-medium">Total generated</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
                  <span className="text-[10px] font-bold text-[#666666] uppercase">Projects</span>
                  <div className="text-xl font-black text-[#101010] mt-1">
                    {memberSummary.projectClosed}
                  </div>
                  <span className="text-[10px] text-[#888888] font-medium">Closed deals</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
                  <span className="text-[10px] font-bold text-[#666666] uppercase">Leaderboard Rank</span>
                  <div className="text-xl font-black text-[#101010] mt-1">
                    #{memberSummary.rank}
                  </div>
                  <span className="text-[10px] text-[#666666] font-medium">{memberSummary.weeksSubmitted} week(s) logged</span>
                </div>
              </div>
            </div>
          )}

          {/* Submitted Logs History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#101010] uppercase tracking-wider">
              Weekly Logs in {selectedMonth} {selectedYear} ({memberRecords.length} entries)
            </h4>
            {memberRecords.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] text-center text-[#666666] text-xs font-medium">
                No weekly logs submitted for this period yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#e2ebd9]">
                <table className="w-full text-left text-xs bg-white">
                  <thead>
                    <tr className="border-b border-[#e2ebd9] text-[10px] font-bold text-[#555555] uppercase bg-[#f8faf6]">
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
                  <tbody className="divide-y divide-[#edf3e7] text-[#101010]">
                    {memberRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-[#f8faf6] transition-colors">
                        <td className="py-2.5 px-3 font-bold text-[#101010]">{r.weekName}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">${r.revenueGenerated.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-bold text-[#101010]">{r.projectClosed}</td>
                        <td className="py-2.5 px-3 font-bold text-blue-700">{r.upsells}</td>
                        <td className="py-2.5 px-3 font-bold text-amber-700">{r.clientRating.toFixed(1)} ★</td>
                        <td className="py-2.5 px-3 font-medium text-[#555555]">{r.followupsCompleted}</td>
                        <td className="py-2.5 px-3 font-medium text-[#555555]">{r.repeatClients}</td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => {
                              onClose();
                              openDataEntryModal(r, r.periodId);
                            }}
                            className="p-1.5 rounded-lg bg-white hover:bg-[#f0f4ec] text-[#555555] hover:text-[#101010] border border-[#e2ebd9] transition-colors cursor-pointer"
                            title="Edit Submission"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {deleteConfirmId === r.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={async () => {
                                  await deletePerformanceRecord(r.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300 text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(r.id)}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-[#888888] hover:text-rose-600 border border-[#e2ebd9] transition-colors cursor-pointer"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        <div className="p-4 border-t border-[#e2ebd9] bg-[#f8faf6] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#101010] text-white hover:bg-black transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
