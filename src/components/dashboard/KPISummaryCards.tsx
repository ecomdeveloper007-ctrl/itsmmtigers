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
  const { leaderboardData, settings } = useApp();
  const { teamStats, periodFilter, month, year } = leaderboardData;

  const cards = [
    {
      title: 'Total Team Members',
      value: teamStats.totalMembers,
      subtitle: 'Active Tiger Performers',
      icon: Users,
      color: 'text-indigo-400',
      bgColor: 'from-indigo-500/10 to-indigo-950/30',
      borderColor: 'border-indigo-500/30',
    },
    {
      title: 'Total Projects Closed',
      value: teamStats.totalProjects,
      subtitle: 'Client Campaigns Delivered',
      icon: Briefcase,
      color: 'text-orange-400',
      bgColor: 'from-orange-500/10 to-orange-950/30',
      borderColor: 'border-orange-500/30',
    },
    {
      title: 'Total Revenue Generated',
      value: `${settings.currencySymbol || '$'}${teamStats.totalRevenue.toLocaleString()}`,
      subtitle: 'Aggregate Team Billing',
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'from-emerald-500/10 to-emerald-950/30',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Total Upsells',
      value: teamStats.totalUpsells,
      subtitle: 'Package & Retainer Expansions',
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgColor: 'from-cyan-500/10 to-cyan-950/30',
      borderColor: 'border-cyan-500/30',
    },
    {
      title: 'Average Client Rating',
      value: teamStats.avgClientRating > 0 ? `${teamStats.avgClientRating.toFixed(2)} ★` : '0.0 ★',
      subtitle: 'Out of 5.0 Star Satisfaction',
      icon: Star,
      color: 'text-amber-400',
      bgColor: 'from-amber-500/10 to-amber-950/30',
      borderColor: 'border-amber-500/30',
    },
    {
      title: 'Total Follow-ups Completed',
      value: teamStats.totalFollowups,
      subtitle: 'Client Engagement Touches',
      icon: PhoneCall,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/10 to-purple-950/30',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Total Repeat Clients',
      value: teamStats.totalRepeatClients,
      subtitle: 'Recurring Account Retentions',
      icon: Repeat,
      color: 'text-pink-400',
      bgColor: 'from-pink-500/10 to-pink-950/30',
      borderColor: 'border-pink-500/30',
    },
    {
      title: 'Average Team Score',
      value: `${teamStats.avgTeamScore.toFixed(2)} / 100`,
      subtitle: 'Overall Weighted Performance',
      icon: Award,
      color: 'text-amber-300',
      bgColor: 'from-amber-500/15 via-orange-950/40 to-slate-900',
      borderColor: 'border-amber-500/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative rounded-2xl bg-gradient-to-br ${card.bgColor} border ${card.borderColor} p-5 shadow-lg backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:shadow-xl`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <p className="text-2xl font-black text-white tracking-tight">{card.value}</p>
                <p className="text-[11px] text-slate-400 font-medium">{card.subtitle}</p>
              </div>

              <div className={`p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
