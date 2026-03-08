import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const BASE_URL = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────

type RiskCategory = 'critical' | 'high' | 'medium' | 'low';

interface RiskDistItem   { _id: RiskCategory; count: number }
interface InterventionItem { _id: string;     count: number }
interface TrendItem        { _id: string | null; count: number }

interface AnalyticsData {
  totalStudents:     number;
  avgRiskScore:      string | number;
  riskDistribution:  RiskDistItem[];
  interventionStats: InterventionItem[];
  trendStats:        TrendItem[];
}

interface RiskScore {
  _id:          string;
  riskScore:    number;
  riskCategory: RiskCategory;
  student?: {
    name:       string;
    studentId:  string;
    department: string;
    semester:   number;
  };
}

interface DeptRisk {
  dept:     string;
  high:     number;
  medium:   number;
  low:      number;
  critical: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const PIE_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high:     '#ef4444',
  medium:   '#f97316',
  low:      '#10b981',
};

const DEPT_COLORS = ['#6366f1', '#f97316', '#ef4444', '#10b981', '#3b82f6', '#a855f7'];

// ── Sub-components ─────────────────────────────────────────────────────────

interface StatCardProps {
  icon:   string;
  label:  string;
  value:  number | string;
  sub:    string;
  accent: 'blue' | 'red' | 'orange' | 'emerald' | 'purple';
}
const ACCENT_MAP: Record<StatCardProps['accent'], string> = {
  blue:    'bg-blue-50 text-blue-600',
  red:     'bg-red-50 text-red-600',
  orange:  'bg-orange-50 text-orange-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  purple:  'bg-purple-50 text-purple-600',
};
function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-4 ${ACCENT_MAP[accent]} border border-white shadow-sm`}>
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-0.5">{value}</p>
      <p className="text-xs opacity-60 mt-1">{sub}</p>
    </div>
  );
}

interface CardProps {
  title:     string;
  children:  React.ReactNode;
  className?: string;
  loading?:  boolean;
}
function Card({ title, children, className = '', loading }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-5 ${className}`}>
      <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">{title}</h2>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [analytics,   setAnalytics]  = useState<AnalyticsData | null>(null);
  const [riskScores,  setRiskScores] = useState<RiskScore[]>([]);
  const [loading,     setLoading]    = useState(true);
  const [error,       setError]      = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const token   = localStorage.getItem('token');
      const headers: HeadersInit = { Authorization: `Bearer ${token}` };

      const [aRes, rRes] = await Promise.all([
        fetch(`${BASE_URL}/admin/analytics`,       { headers }),
        fetch(`${BASE_URL}/counselor/risk-scores`, { headers }),
      ]);

      if (!aRes.ok) throw new Error('Failed to fetch analytics');
      if (!rRes.ok) throw new Error('Failed to fetch risk scores');

      const aJson = await aRes.json();
      const rJson = await rRes.json();

      setAnalytics(aJson.data as AnalyticsData);
      setRiskScores((rJson.analyses ?? []) as RiskScore[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  // KPI counts from riskDistribution
  const getCount = (cat: RiskCategory) =>
    analytics?.riskDistribution?.find((r) => r._id === cat)?.count ?? 0;

  const criticalCount = getCount('critical');
  const highCount     = getCount('high');
  const medCount      = getCount('medium');
  const lowCount      = getCount('low');
  const totalStudents = analytics?.totalStudents ?? 0;
  const avgScore      = Number(analytics?.avgRiskScore ?? 0);

  // Pie data
  const pieData = [
    { name: 'Critical', value: criticalCount, color: PIE_COLORS.critical },
    { name: 'High',     value: highCount,     color: PIE_COLORS.high     },
    { name: 'Medium',   value: medCount,      color: PIE_COLORS.medium   },
    { name: 'Low',      value: lowCount,      color: PIE_COLORS.low      },
  ].filter((d) => d.value > 0);

  // Department risk breakdown from real risk scores
  const deptMap = new Map<string, DeptRisk>();
  riskScores.forEach((r) => {
    const dept = r.student?.department ?? 'Unknown';
    if (!deptMap.has(dept)) {
      deptMap.set(dept, { dept, high: 0, medium: 0, low: 0, critical: 0 });
    }
    const entry = deptMap.get(dept)!;
    if      (r.riskCategory === 'critical') entry.critical++;
    else if (r.riskCategory === 'high')     entry.high++;
    else if (r.riskCategory === 'medium')   entry.medium++;
    else                                    entry.low++;
  });
  const deptRiskData: DeptRisk[] = Array.from(deptMap.values());

  // Semester-wise avg risk score (as a proxy for trend)
  const semesterMap = new Map<number, { total: number; count: number }>();
  riskScores.forEach((r) => {
    const sem = r.student?.semester ?? 0;
    if (!semesterMap.has(sem)) semesterMap.set(sem, { total: 0, count: 0 });
    const e = semesterMap.get(sem)!;
    e.total += r.riskScore;
    e.count++;
  });
  const semTrendData = Array.from(semesterMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([sem, { total, count }]) => ({
      semester: `Sem ${sem}`,
      avgRisk:  parseFloat((total / count).toFixed(3)),
    }));

  // Recent high/critical students table
  const atRiskStudents = riskScores
    .filter((r) => ['critical', 'high'].includes(r.riskCategory))
    .slice(0, 6);

  // ── Render ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl text-red-600 text-sm">
        ⚠️ {error}
        <button onClick={fetchAll} className="ml-3 underline font-medium">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">System-wide academic risk overview</p>
        </div>
        <button
          onClick={fetchAll}
          className="text-xs px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard icon="🎓" label="Total Students"   value={totalStudents}                      sub="Active enrollments"      accent="blue"    />
        <StatCard icon="💀" label="Critical Risk"    value={criticalCount}                      sub="Immediate action needed" accent="red"     />
        <StatCard icon="🔴" label="High Risk"        value={highCount}                          sub="Needs attention"         accent="orange"  />
        <StatCard icon="🟠" label="Medium Risk"      value={medCount}                           sub="Monitoring required"     accent="purple"  />
        <StatCard icon="🟢" label="Low / Safe"       value={lowCount}                           sub="On track"                accent="emerald" />
      </div>

      {/* Avg risk banner */}
      <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm">
        <p className="text-sm text-slate-500">Institution Average Risk Score</p>
        <p className={`text-xl font-bold ${avgScore > 0.6 ? 'text-red-500' : avgScore > 0.4 ? 'text-orange-500' : 'text-emerald-600'}`}>
          {(avgScore * 100).toFixed(1)}%
        </p>
      </div>

      {/* Row 1 — Pie + Dept Bar */}
      <div className="grid grid-cols-3 gap-5">
        <Card title="Risk Distribution" loading={loading}>
          {pieData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No risk data yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={3} dataKey="value"
                  >
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-around mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="text-center">
                    <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1" style={{ background: d.color }} />
                    <p className="text-xs text-slate-500">{d.name}</p>
                    <p className="font-bold text-slate-700">{d.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card title="Department Risk Breakdown" className="col-span-2" loading={loading}>
          {deptRiskData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No department data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptRiskData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="critical" fill="#dc2626" radius={[4,4,0,0]} name="Critical" />
                <Bar dataKey="high"     fill="#ef4444" radius={[4,4,0,0]} name="High"     />
                <Bar dataKey="medium"   fill="#f97316" radius={[4,4,0,0]} name="Medium"   />
                <Bar dataKey="low"      fill="#10b981" radius={[4,4,0,0]} name="Low"      />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Row 2 — Semester Trend + At-Risk Table */}
      <div className="grid grid-cols-2 gap-5">
        <Card title="Avg Risk Score by Semester" loading={loading}>
          {semTrendData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No semester data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={semTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                <Line type="monotone" dataKey="avgRisk" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Avg Risk" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Top At-Risk Students" loading={loading}>
          {atRiskStudents.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No high/critical risk students 🎉</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {atRiskStudents.map((r) => (
                <div key={r._id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{r.student?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{r.student?.studentId} · Sem {r.student?.semester} · {r.student?.department}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${
                      r.riskCategory === 'critical' ? 'bg-red-600' :
                      r.riskCategory === 'high'     ? 'bg-orange-500' : 'bg-amber-500'
                    }`}>
                      {r.riskCategory.toUpperCase()}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">{(r.riskScore * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}