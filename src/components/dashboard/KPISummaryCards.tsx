import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Star,
  PhoneCall,
  Repeat,
  Award,
} from 'lucide-react';

export const KPISummaryCards: React.FC = () => {
  const { leaderboardData, settings, selectedTeam } = useApp();
  const { teamStats, revenueSummary } = leaderboardData;

  const teamPrefix =
    selectedTeam === 'it' ? 'IT Team ' : selectedTeam === 'smm' ? 'SMM Team ' : 'Total ';

  const sym = settings.currencySymbol || '$';

  const grossRevenue =
    selectedTeam === 'it'
      ? revenueSummary?.itTeam?.grossRevenue ?? revenueSummary?.itRevenue?.grossRevenue ?? teamStats?.totalRevenue ?? 0
      : selectedTeam === 'smm'
      ? revenueSummary?.smmTeam?.grossRevenue ?? revenueSummary?.smmRevenue?.grossRevenue ?? teamStats?.totalRevenue ?? 0
      : revenueSummary?.totalGrossRevenue ?? revenueSummary?.grandTotal?.grossRevenue ?? teamStats?.totalRevenue ?? 0;

  const netRevenue =
    selectedTeam === 'it'
      ? revenueSummary?.itTeam?.netRevenue ?? revenueSummary?.itRevenue?.finalNetRevenue ?? Math.round(grossRevenue * 0.8)
      : selectedTeam === 'smm'
      ? revenueSummary?.smmTeam?.netRevenue ?? revenueSummary?.smmRevenue?.finalNetRevenue ?? Math.round(grossRevenue * 0.8)
      : revenueSummary?.totalNetRevenue ?? revenueSummary?.grandTotal?.finalNetRevenue ?? Math.round(grossRevenue * 0.8);

  const feeAmount = Math.round((grossRevenue || 0) * 0.2);

  const cards = [
    {
      title: `${teamPrefix}Members`,
      value: teamStats?.totalMembers ?? 0,
      subtitle:
        selectedTeam === 'it'
          ? 'Active Tech Tigers (PR, WR, HW)'
          : selectedTeam === 'smm'
          ? 'Active Social Tigers (RR, DR)'
          : 'Active Tiger Performers (5 Profiles)',
      icon: Users,
      iconColor: 'text-[#436320]',
      iconBg: 'bg-[#f3f8ef] border-[#8cc540]/30',
    },
    {
      title: `${teamPrefix}Projects Closed`,
      value: teamStats?.totalProjects ?? 0,
      subtitle:
        selectedTeam === 'it'
          ? 'IT Solutions & Apps Delivered'
          : selectedTeam === 'smm'
          ? 'Client Campaigns Delivered'
          : 'Total Projects Delivered',
      icon: Briefcase,
      iconColor: 'text-blue-700',
      iconBg: 'bg-blue-50 border-blue-200',
    },
    {
      title: `${teamPrefix}Final Net Revenue`,
      value: `${sym}${(netRevenue || 0).toLocaleString()}`,
      subtitle: `Gross: ${sym}${(grossRevenue || 0).toLocaleString()} (-20% fee: -${sym}${(feeAmount || 0).toLocaleString()})`,
      icon: DollarSign,
      iconColor: 'text-[#436320]',
      iconBg: 'bg-[#8cc540]/20 border-[#8cc540]',
      highlight: true,
    },
    {
      title: `${teamPrefix}Upsells`,
      value: teamStats?.totalUpsells ?? 0,
      subtitle:
        selectedTeam === 'it'
          ? 'Tech Addons & Maintenance Expansions'
          : selectedTeam === 'smm'
          ? 'Package & Retainer Expansions'
          : 'Upsell Expansions',
      icon: TrendingUp,
      iconColor: 'text-purple-700',
      iconBg: 'bg-purple-50 border-purple-200',
    },
    {
      title: `${teamPrefix}Avg Rating`,
      value: (teamStats?.avgClientRating ?? 0) > 0 ? `${(teamStats.avgClientRating).toFixed(2)} ★` : '0.0 ★',
      subtitle: 'Out of 5.0 Star Satisfaction',
      icon: Star,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-200',
    },
    {
      title: `${teamPrefix}Follow-ups`,
      value: teamStats?.totalFollowups ?? 0,
      subtitle: 'Client Engagement Touches',
      icon: PhoneCall,
      iconColor: 'text-indigo-700',
      iconBg: 'bg-indigo-50 border-indigo-200',
    },
    {
      title: `${teamPrefix}Repeat Clients`,
      value: teamStats?.totalRepeatClients ?? 0,
      subtitle: 'Recurring Account Retentions',
      icon: Repeat,
      iconColor: 'text-emerald-700',
      iconBg: 'bg-emerald-50 border-emerald-200',
    },
    {
      title: `${teamPrefix}Avg Score`,
      value: `${(teamStats?.avgTeamScore ?? 0).toFixed(2)} / 100`,
      subtitle: 'Division Weighted Performance',
      icon: Award,
      iconColor: 'text-[#101010]',
      iconBg: 'bg-[#8cc540]/30 border-[#8cc540]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative rounded-2xl bg-white border border-[#e2ebd9] p-5 shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-black text-[#555555] uppercase tracking-wider">
                  {card.title}
                </span>
                <p className="text-2xl font-black text-[#101010] tracking-tight">{card.value}</p>
                <p className="text-[11px] text-[#666666] font-medium">{card.subtitle}</p>
              </div>

              <div className={`p-2.5 rounded-xl border ${card.iconBg} ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
