import React, { useState } from 'react';
import Card from '../components/Card';
import RiskBadge from '../components/RiskBadge';
import { STUDENTS } from '../data';

type Ratings = Record<number, Record<string, number>>;

const CRITERIA: [string, string][] = [
  ['Participation', '🙋'],
  ['Attention',     '👁️'],
  ['Discipline',    '📐'],
];

export default function BehaviorRating() {
  const [ratings, setRatings] = useState<Ratings>({});
  const students = STUDENTS.slice(0, 5);

  const getR = (id: number, key: string) => ratings[id]?.[key] ?? 5;
  const setR = (id: number, key: string, val: number) =>
    setRatings((r) => ({ ...r, [id]: { ...(r[id] ?? {}), [key]: val } }));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Behavior Rating</h1>
      <p className="text-slate-500 text-sm">Rate students on behavior indicators (1–10 scale)</p>

      <div className="space-y-4">
        {students.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                {s.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-slate-700">{s.name}</p>
                <p className="text-xs text-slate-400">{s.dept} Department</p>
              </div>
              <div className="ml-auto">
                <RiskBadge risk={s.risk} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {CRITERIA.map(([label, icon]) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">{icon} {label}</span>
                    <span className="text-sm font-bold text-emerald-600">{getR(s.id, label)}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={getR(s.id, label)}
                    onChange={(e) => setR(s.id, label, Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors">
        Submit Behavior Ratings
      </button>
    </div>
  );
}
