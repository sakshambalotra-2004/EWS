import React from 'react';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import RiskBadge from '../components/RiskBadge';
import { CURRENT_STUDENT } from '../data';

interface StudentDashboardProps {
  riskGenerated: boolean;
}

export default function StudentDashboard({ riskGenerated }: StudentDashboardProps) {
  const s = CURRENT_STUDENT;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
          LW
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {s.name} 👋</h1>
          <p className="text-slate-500 text-sm">{s.dept} Department • Spring 2025</p>
        </div>
        {riskGenerated && (
          <div className="ml-auto">
            <RiskBadge risk={s.risk} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon="📊" label="Current GPA"      value={s.gpa}           sub="Target: 3.5"        accent="blue"                                  />
        <StatCard icon="📅" label="Attendance"        value={`${s.attendance}%`} sub="Minimum: 75%"   accent="emerald"                               />
        <StatCard icon="📚" label="Failed Subjects"   value={s.failed}        sub="This semester"      accent={s.failed > 0 ? 'red' : 'emerald'}      />
      </div>

      {riskGenerated && (
        <Card title="AI Recommendations">
          <div className="space-y-2">
            {s.risk === 'low' ? (
              <>
                <div className="flex gap-3 items-start p-3 bg-emerald-50 rounded-xl">
                  <span className="text-xl">🌟</span>
                  <p className="text-sm font-medium text-emerald-800">
                    You're on track! Keep maintaining your attendance and GPA.
                  </p>
                </div>
                <div className="flex gap-3 items-start p-3 bg-blue-50 rounded-xl">
                  <span className="text-xl">📈</span>
                  <p className="text-sm font-medium text-blue-800">
                    Consider joining the honors program to strengthen your academic profile.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex gap-3 items-start p-3 bg-amber-50 rounded-xl">
                <span className="text-xl">⚠️</span>
                <p className="text-sm font-medium text-amber-800">
                  Please visit your academic counselor for support.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
