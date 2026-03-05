import React from 'react';
import StatCard from '../components/StatCard';
import Card from '../components/Card';

const ACTIVITY = [
  { icon: '📤', text: 'Uploaded midterm marks for CS301', time: '2 hours ago'  },
  { icon: '⭐', text: 'Submitted behavior ratings for 12 students', time: 'Yesterday' },
  { icon: '📋', text: 'Marks upload pending for CS401', time: '3 days ago'  },
];

export default function FacultyDashboard() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Faculty Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage marks and student behavior</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon="📚" label="My Courses"        value={4}  sub="This semester"    accent="blue"   />
        <StatCard icon="👥" label="My Students"       value={48} sub="Across all courses" accent="emerald" />
        <StatCard icon="⚠️" label="Flagged Students"  value={7}  sub="Needs attention"  accent="orange" />
      </div>

      <Card title="Recent Activity">
        <div className="space-y-3">
          {ACTIVITY.map(({ icon, text, time }, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="text-lg">{icon}</span>
              <div>
                <p className="text-sm text-slate-700 font-medium">{text}</p>
                <p className="text-xs text-slate-400 mt-0.5">{time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
