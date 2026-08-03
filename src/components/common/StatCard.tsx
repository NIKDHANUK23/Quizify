import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  colorScheme?: 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'positive',
  colorScheme = 'amber',
}) => {
  const schemeStyles = {
    indigo: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="p-5 bg-[#1C1C1E] rounded-xl border border-white/10 shadow-lg hover:border-white/20 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-lg border ${schemeStyles[colorScheme]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-semibold text-[#F4F4F5] tracking-tight">{value}</div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              trendType === 'positive'
                ? 'bg-emerald-500/10 text-emerald-400'
                : trendType === 'negative'
                ? 'bg-rose-500/10 text-rose-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-2 text-xs text-[#A1A1AA]">{subtitle}</p>}
    </div>
  );
};
