import React, { useState } from 'react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import RiskBadge from '../components/RiskBadge';
import { STUDENTS } from '../data';
import type { Student, RiskLevel } from '../types';

interface RiskAnalysisProps {
  riskGenerated: boolean;
}

type BarColor = 'emerald' | 'red' | 'orange' | 'blue';

function riskColor(risk: RiskLevel): string {
  return risk === 'high' ? 'text-red-500' : risk === 'medium' ? 'text-orange-400' : 'text-emerald-500';
}

function attendanceColor(v: number): BarColor {
  return v < 60 ? 'red' : v < 75 ? 'orange' : 'emerald';
}

function gpaColor(v: number): BarColor {
  return v < 2 ? 'red' : v < 2.5 ? 'orange' : 'emerald';
}

export default function RiskAnalysis({ riskGenerated }: RiskAnalysisProps) {
  const [selected, setSelected] = useState<Student | null>(null);
  const sorted = [...STUDENTS].sort((a, b) => b.score - a.score);

  if (!riskGenerated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <div className="text-5xl">🔒</div>
        <p className="text-slate-600 font-semibold">Run AI prediction first</p>
        <p className="text-slate-400 text-sm">Go to "Generate Prediction" to unlock risk analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Risk Analysis</h1>

      <div className="grid grid-cols-5 gap-4">
        {/* Student list */}
        <div className="col-span-2 space-y-3">
          {sorted.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelected(s)}
              className={`p-3 rounded-xl cursor-pointer transition-all border shadow-sm ${
                selected?.id === s.id
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">
                  {s.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-700 text-sm truncate">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.dept}</p>
                </div>
                <div className="text-right">
                  <RiskBadge risk={s.risk} />
                  <p className="text-xs text-slate-400 mt-1">Score: {s.score}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="col-span-3">
          {selected ? (
            <Card title={`Risk Profile — ${selected.name}`}>
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black">
                    {selected.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">{selected.name}</p>
                    <p className="text-sm text-slate-400">{selected.dept} • GPA: {selected.gpa}</p>
                  </div>
                  <div className="ml-auto text-center">
                    <p className={`text-3xl font-black ${riskColor(selected.risk)}`}>{selected.score}</p>
                    <p className="text-xs text-slate-400">Risk Score</p>
                  </div>
                </div>

                {/* Factors */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Contributing Factors
                  </h4>
                  <div className="space-y-3">
                    <ProgressBar
                      value={selected.attendance}
                      label="Attendance Rate"
                      color={attendanceColor(selected.attendance)}
                    />
                    <ProgressBar
                      value={Math.round((selected.gpa / 4) * 100)}
                      label="GPA Health"
                      color={gpaColor(selected.gpa)}
                    />
                    <ProgressBar
                      value={Math.max(0, 100 - selected.failed * 25)}
                      label="Pass Rate"
                      color={selected.failed > 2 ? 'red' : selected.failed > 0 ? 'orange' : 'emerald'}
                    />
                    <ProgressBar
                      value={Math.max(0, 100 - selected.score)}
                      label="Overall Academic Health"
                      color={selected.risk === 'high' ? 'red' : selected.risk === 'medium' ? 'orange' : 'emerald'}
                    />
                  </div>
                </div>

                {/* Key indicators */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Key Indicators
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { label: 'Failed', val: selected.failed, color: selected.failed > 2 ? 'text-red-500' : selected.failed > 0 ? 'text-orange-400' : 'text-emerald-500' },
                      { label: 'GPA',    val: selected.gpa,    color: selected.gpa < 2 ? 'text-red-500' : selected.gpa < 2.5 ? 'text-orange-400' : 'text-emerald-500' },
                      { label: 'Attend.', val: `${selected.attendance}%`, color: selected.attendance < 60 ? 'text-red-500' : selected.attendance < 75 ? 'text-orange-400' : 'text-emerald-500' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="bg-slate-50 p-2.5 rounded-lg text-center">
                        <p className="text-slate-400">{label}</p>
                        <p className={`font-bold text-lg ${color}`}>{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-2">
              <span className="text-4xl">👈</span>
              <p className="font-medium">Select a student to view risk profile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
