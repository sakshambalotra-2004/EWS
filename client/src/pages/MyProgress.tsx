import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { CURRENT_STUDENT } from '../data';

const GPA_TREND = [
  { sem: 'Sem 1', gpa: 3.1 },
  { sem: 'Sem 2', gpa: 3.3 },
  { sem: 'Sem 3', gpa: 3.2 },
  { sem: 'Sem 4', gpa: 3.4 },
];

const COURSES = [
  { name: 'BBA301 — Marketing', midterm: 82, final: null, grade: 'B+' },
  { name: 'BBA302 — Finance',   midterm: 91, final: null, grade: 'A'  },
  { name: 'BBA303 — Strategy',  midterm: 78, final: null, grade: 'B'  },
  { name: 'BBA304 — HRM',       midterm: 88, final: null, grade: 'A-' },
];

export default function MyProgress() {
  const s = CURRENT_STUDENT;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">My Progress</h1>

      <div className="grid grid-cols-2 gap-5">
        <Card title="GPA Trend">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={GPA_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="sem" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[2.5, 4.0]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Line type="monotone" dataKey="gpa" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Academic Metrics">
          <div className="space-y-4 mt-2">
            <ProgressBar value={s.attendance} label="Attendance" color={s.attendance < 75 ? 'red' : 'emerald'} />
            <ProgressBar value={Math.round((s.gpa / 4) * 100)} label="GPA Health" color="emerald" />
            <ProgressBar value={95} label="Assignment Completion" color="blue" />
            <ProgressBar value={80} label="Class Participation"   color="emerald" />
          </div>
        </Card>
      </div>

      <Card title="Course Grades">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {['Course', 'Midterm', 'Final', 'Grade'].map((h) => (
                <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COURSES.map(({ name, midterm, final, grade }) => (
              <tr key={name} className="border-b border-slate-50">
                <td className="py-3 px-3 font-medium text-slate-700">{name}</td>
                <td className="py-3 px-3 text-slate-600">{midterm}</td>
                <td className="py-3 px-3 text-slate-400">{final ?? 'Pending'}</td>
                <td className="py-3 px-3">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold">
                    {grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
