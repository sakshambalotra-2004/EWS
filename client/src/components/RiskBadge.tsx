import React from 'react';

type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

interface RiskBadgeProps {
  risk: RiskLevel;
}

const BADGE_CLASSES: Record<RiskLevel, string> = {
  critical: 'bg-red-200 text-red-800 border border-red-300',
  high:     'bg-red-100 text-red-700 border border-red-200',
  medium:   'bg-orange-100 text-orange-700 border border-orange-200',
  low:      'bg-emerald-100 text-emerald-700 border border-emerald-200',
};

const DOT_CLASSES: Record<RiskLevel, string> = {
  critical: 'bg-red-700',
  high:     'bg-red-500',
  medium:   'bg-orange-400',
  low:      'bg-emerald-500',
};

export default function RiskBadge({ risk }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${BADGE_CLASSES[risk]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_CLASSES[risk]}`} />
      {risk.charAt(0).toUpperCase() + risk.slice(1)}
    </span>
  );
}