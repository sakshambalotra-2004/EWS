import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import { STUDENTS, ATTENDANCE_TREND, DEPT_RISK, PIE_COLORS } from '../data';

export default function AdminDashboard() {
  const high = STUDENTS.filter((s) => s.risk === 'high').length;
  const med  = STUDENTS.filter((s) => s.risk === 'medium').length;
  const low  = STUDENTS.filter((s) => s.risk === 'low').length;

  const pieData = [
    { name: 'High Risk',   value: high },
    { name: 'Medium Risk', value: med  },
    { name: 'Low Risk',    value: low  },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">System-wide academic risk overview</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="🎓" label="Total Students"  value={STUDENTS.length} sub="Enrolled this semester"   accent="blue"    />
        <StatCard icon="🔴" label="High Risk"        value={high}            sub="Immediate attention needed" accent="red"   />
        <StatCard icon="🟠" label="Medium Risk"      value={med}             sub="Monitoring required"       accent="orange" />
        <StatCard icon="🟢" label="Low Risk"         value={low}             sub="On track"                  accent="emerald"/>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <Card title="Risk Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={[PIE_COLORS.high, PIE_COLORS.medium, PIE_COLORS.low][i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-2.5 h-2.5 rounded-full mx-auto mb-1"
                  style={{ background: [PIE_COLORS.high, PIE_COLORS.medium, PIE_COLORS.low][i] }}
                />
                <p className="text-xs text-slate-500">{d.name.split(' ')[0]}</p>
                <p className="font-bold text-slate-700">{d.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Department Risk Breakdown" className="col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DEPT_RISK} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dept" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="high"   fill="#ef4444" radius={[4,4,0,0]} name="High"   />
              <Bar dataKey="medium" fill="#f97316" radius={[4,4,0,0]} name="Medium" />
              <Bar dataKey="low"    fill="#10b981" radius={[4,4,0,0]} name="Low"    />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Attendance Trends by Department">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={ATTENDANCE_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis domain={[55, 95]}  tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="CS"  stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="EE"  stroke="#f97316" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ME"  stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="BBA" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
