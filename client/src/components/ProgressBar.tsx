import React from 'react';

type BarColor = 'emerald' | 'red' | 'orange' | 'blue';

interface ProgressBarProps {
  value: number;
  color?: BarColor;
  label?: string;
  max?: number;
}

const COLOR_MAP: Record<BarColor, string> = {
  emerald: 'bg-emerald-500',
  red:     'bg-red-500',
  orange:  'bg-orange-400',
  blue:    'bg-blue-500',
};

export default function ProgressBar({ value, color = 'emerald', label, max = 100 }: ProgressBarProps) {
  const pct = Math.round((value / max) * 100);

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>{label}</span>
          <span className="font-medium text-slate-700">
            {value}{max === 100 ? '%' : `/${max}`}
          </span>
        </div>
      )}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${COLOR_MAP[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
