import React from 'react';

type Accent = 'emerald' | 'red' | 'orange' | 'blue' | 'purple';

interface StatCardProps {
  icon:    string;
  label:   string;
  value:   string | number;
  sub?:    string;
  accent?: Accent;
}

const ACCENTS: Record<Accent, string> = {
  emerald: 'from-emerald-500 to-teal-600',
  red:     'from-red-500 to-rose-600',
  orange:  'from-orange-400 to-amber-500',
  blue:    'from-blue-500 to-indigo-600',
  purple:  'from-purple-500 to-violet-600',
};

export default function StatCard({ icon, label, value, sub, accent = 'emerald' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ACCENTS[accent]} flex items-center justify-center text-white text-lg shadow-sm`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}