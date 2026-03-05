import React, { useState } from 'react';
import Card from '../components/Card';
import { INTERVENTIONS, STUDENTS } from '../data';
import type { Intervention } from '../types';

const INTERVENTION_TYPES = [
  'Academic Counseling',
  'Parent Notification',
  'Tutoring Session',
  'Peer Mentoring',
  'Warning Letter',
];

const STATUS_COLORS: Record<string, string> = {
  Active:    'bg-blue-100 text-blue-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Scheduled: 'bg-amber-100 text-amber-700',
};

export default function Interventions() {
  const [showForm, setShowForm]   = useState(false);
  const [list, setList]           = useState<Intervention[]>(INTERVENTIONS);
  const [student, setStudent]     = useState('');
  const [type, setType]           = useState(INTERVENTION_TYPES[0]);
  const [notes, setNotes]         = useState('');

  const handleCreate = () => {
    if (!student) return;
    setList((l) => [
      ...l,
      {
        id:      l.length + 1,
        student,
        type,
        status:  'Scheduled',
        date:    new Date().toISOString().split('T')[0],
      },
    ]);
    setShowForm(false);
    setStudent('');
    setType(INTERVENTION_TYPES[0]);
    setNotes('');
  };

  const atRiskStudents = STUDENTS.filter((s) => s.risk !== 'low');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Interventions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors"
        >
          + New Intervention
        </button>
      </div>

      {showForm && (
        <Card title="Create Intervention">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</label>
              <select
                value={student}
                onChange={(e) => setStudent(e.target.value)}
                className="w-full mt-1.5 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="">Select student…</option>
                {atRiskStudents.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Intervention Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full mt-1.5 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                {INTERVENTION_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Describe the intervention plan…"
                className="w-full mt-1.5 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {['Student', 'Type', 'Status', 'Date', 'Action'].map((h) => (
                <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((iv) => (
              <tr key={iv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3 font-medium text-slate-700">{iv.student}</td>
                <td className="py-3 px-3 text-slate-500">{iv.type}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[iv.status]}`}>
                    {iv.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400">{iv.date}</td>
                <td className="py-3 px-3">
                  <button className="text-emerald-600 hover:text-emerald-800 text-xs font-medium">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
