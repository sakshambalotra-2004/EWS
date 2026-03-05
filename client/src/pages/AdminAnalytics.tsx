import React from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Card from '../components/Card';

const GPA_DIST = [
  { range: '<2.0',    count: 2 },
  { range: '2.0-2.5', count: 2 },
  { range: '2.5-3.0', count: 3 },
  { range: '3.0-3.5', count: 2 },
  { range: '>3.5',    count: 1 },
];

const RISK_TREND = [
  { w: 'W1', high: 2, medium: 2, low: 6 },
  { w: 'W2', high: 3, medium: 2, low: 5 },
  { w: 'W3', high: 3, medium: 3, low: 4 },
  { w: 'W4', high: 4, medium: 2, low: 4 },
  { w: 'W5', high: 4, medium: 3, low: 3 },
  { w: 'W6', high: 4, medium: 3, low: 3 },
];

const METRICS = [
  { label: 'Model Accuracy', value: '91.4%', sub: '↑ 2.1% from last month' },
  { label: 'Precision',      value: '88.7%', sub: 'True positive rate'      },
  { label: 'Recall',         value: '93.2%', sub: 'Sensitivity score'       },
];

export default function AdminAnalytics() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>

      <div className="grid grid-cols-2 gap-5">
        <Card title="GPA Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={GPA_DIST} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Risk Trend (Last 6 Weeks)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={RISK_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="w" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="high"   stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="medium" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="low"    stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Prediction Accuracy Metrics">
        <div className="grid grid-cols-3 gap-6">
          {METRICS.map(({ label, value, sub }) => (
            <div key={label} className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
