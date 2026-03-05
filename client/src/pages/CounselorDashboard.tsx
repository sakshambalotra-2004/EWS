import React from 'react';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import RiskBadge from '../components/RiskBadge';
import { STUDENTS, INTERVENTIONS } from '../data';

interface CounselorDashboardProps {
  riskGenerated: boolean;
}

export default function CounselorDashboard({ riskGenerated }: CounselorDashboardProps) {
  const high = STUDENTS.filter((s) => s.risk === 'high').length;
  const med  = STUDENTS.filter((s) => s.risk === 'medium').length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Counselor Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Monitor at-risk students and manage interventions</p>
      </div>

      {!riskGenerated && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Risk predictions not yet generated</p>
            <p className="text-amber-600 text-xs mt-0.5">Go to "Generate Prediction" to run the AI analysis.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="👥" label="My Students"   value={STUDENTS.length}       accent="blue"    />
        <StatCard icon="🔴" label="High Risk"      value={high}                  accent="red"     />
        <StatCard icon="🟠" label="Medium Risk"    value={med}                   accent="orange"  />
        <StatCard icon="💬" label="Interventions"  value={INTERVENTIONS.length}  sub="Active cases" accent="emerald" />
      </div>

      <Card title="Students Requiring Attention">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {['Student', 'Dept', 'GPA', 'Attendance', 'Risk'].map((h) => (
                <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STUDENTS.filter((s) => s.risk !== 'low').map((s) => (
              <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3 font-medium text-slate-700">{s.name}</td>
                <td className="py-3 px-3 text-slate-500">{s.dept}</td>
                <td className={`py-3 px-3 font-semibold ${s.gpa < 2.0 ? 'text-red-600' : s.gpa < 2.5 ? 'text-orange-500' : 'text-slate-700'}`}>
                  {s.gpa}
                </td>
                <td className={`py-3 px-3 font-semibold ${s.attendance < 60 ? 'text-red-600' : s.attendance < 75 ? 'text-orange-500' : 'text-slate-700'}`}>
                  {s.attendance}%
                </td>
                <td className="py-3 px-3">
                  <RiskBadge risk={s.risk} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
