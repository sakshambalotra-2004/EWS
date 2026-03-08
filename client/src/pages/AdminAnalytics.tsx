import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const BASE_URL = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────

type RiskCategory = 'critical' | 'high' | 'medium' | 'low';
type InterventionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type Trend = 'improving' | 'stable' | 'declining';

interface RiskDistItem   { _id: RiskCategory;         count: number }
interface InterventionItem { _id: InterventionStatus; count: number }
interface TrendItem       { _id: Trend | null;         count: number }

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
  trend:        Trend;
  student?: {
    name:       string;
    studentId:  string;
    department: string;
  };
  performance?: {
    gpa:                  number;
    attendancePercentage: number;
  };
}

// ── Constants ──────────────────────────────────────────────────────────────

const RISK_COLORS: Record<RiskCategory, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#10b981',
};

const INTERVENTION_COLORS: Record<InterventionStatus, string> = {
  pending:     '#f97316',
  in_progress: '#3b82f6',
  completed:   '#10b981',
  cancelled:   '#94a3b8',
};

// ── Sub-components ─────────────────────────────────────────────────────────

interface CardProps {
  title:    string;
  children: React.ReactNode;
  loading?: boolean;
}
function Card({ title, children, loading }: CardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">{title}</h2>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children}
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string | number;
  sub?:  string;
  color?: string;
}
function StatBox({ label, value, sub, color = 'text-emerald-600' }: StatBoxProps) {
  return (
    <div className="text-center p-4 bg-slate-50 rounded-xl">
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function AdminAnalytics() {
  const [data,       setData]       = useState<AnalyticsData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { Authorization: `Bearer ${token}` };

      const [analyticsRes, riskRes] = await Promise.all([
        fetch(`${BASE_URL}/admin/analytics`,       { headers }),
        fetch(`${BASE_URL}/counselor/risk-scores`, { headers }),
      ]);

      if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');
      if (!riskRes.ok)      throw new Error('Failed to fetch risk scores');

      const analytics = await analyticsRes.json();
      const risks     = await riskRes.json();

      setData(analytics.data as AnalyticsData);
      setRiskScores((risks.analyses ?? []) as RiskScore[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived chart data ────────────────────────────────────────────────────

  const riskDistData = (data?.riskDistribution ?? []).map((r) => ({
    name:  r._id,
    value: r.count,
    color: RISK_COLORS[r._id] ?? '#94a3b8',
  }));

  const interventionData = (data?.interventionStats ?? []).map((i) => ({
    status: i._id,
    count:  i.count,
    color:  INTERVENTION_COLORS[i._id] ?? '#94a3b8',
  }));

  const trendData = (data?.trendStats ?? []).map((t) => ({
    trend: t._id ?? 'stable',
    count: t.count,
  }));

  const gpaBuckets: Record<string, number> = { '<4.0': 0, '4.0-5.5': 0, '5.5-7.0': 0, '7.0-8.5': 0, '>8.5': 0 };
  riskScores.forEach((r) => {
    const gpa = r.performance?.gpa ?? 0;
    if      (gpa < 4.0) gpaBuckets['<4.0']++;
    else if (gpa < 5.5) gpaBuckets['4.0-5.5']++;
    else if (gpa < 7.0) gpaBuckets['5.5-7.0']++;
    else if (gpa < 8.5) gpaBuckets['7.0-8.5']++;
    else                gpaBuckets['>8.5']++;
  });
  const gpaDistData = Object.entries(gpaBuckets).map(([range, count]) => ({ range, count }));

  const scoreBuckets: Record<string, number> = { '0-0.2': 0, '0.2-0.4': 0, '0.4-0.6': 0, '0.6-0.8': 0, '0.8-1.0': 0 };
  riskScores.forEach((r) => {
    const s = r.riskScore;
    if      (s < 0.2) scoreBuckets['0-0.2']++;
    else if (s < 0.4) scoreBuckets['0.2-0.4']++;
    else if (s < 0.6) scoreBuckets['0.4-0.6']++;
    else if (s < 0.8) scoreBuckets['0.6-0.8']++;
    else              scoreBuckets['0.8-1.0']++;
  });
  const scoreDistData = Object.entries(scoreBuckets).map(([range, count]) => ({ range, count }));

  // ── Render ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl text-red-600 text-sm">
        ⚠️ {error} — make sure the backend is running and you are logged in as admin.
        <button onClick={fetchAll} className="ml-3 underline">Retry</button>
      </div>
    );
  }

  const totalStudents = data?.totalStudents ?? 0;
  const avgScore      = Number(data?.avgRiskScore ?? 0);
  const atRiskCount   =
    (riskDistData.find((r) => r.name === 'critical')?.value ?? 0) +
    (riskDistData.find((r) => r.name === 'high')?.value     ?? 0);

  return (
    <div className="space-y-5 p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Institution Analytics</h1>
        <button
          onClick={fetchAll}
          className="text-xs px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatBox label="Total Students"   value={totalStudents}                        sub="Active enrollments"    />
        <StatBox label="Avg Risk Score"   value={`${(avgScore * 100).toFixed(1)}%`}    sub="Institution average"   color="text-amber-500" />
        <StatBox label="At Risk Students" value={atRiskCount}                          sub="High + Critical"       color="text-red-500"   />
        <StatBox label="Total Analyses"   value={riskScores.length}                    sub="Risk records in DB"    color="text-blue-500"  />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-5">
        <Card title="Risk Category Distribution" loading={loading}>
          {riskDistData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No risk data yet. Run analyze-all first.</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={riskDistData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={80}
                    label={({ name, percent }: { name: string; percent: number }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {riskDistData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {riskDistData.map((r) => (
                  <div key={r.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: r.color }} />
                    <span className="capitalize text-slate-600">{r.name}</span>
                    <span className="font-bold text-slate-800 ml-auto">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card title="Intervention Status" loading={loading}>
          {interventionData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No interventions created yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={interventionData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {interventionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-5">
        <Card title="GPA Distribution" loading={loading}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gpaDistData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Risk Score Distribution" loading={loading}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreDistData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-2 gap-5">
        <Card title="Student Trend Distribution" loading={loading}>
          {trendData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No trend data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="trend" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {trendData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.trend === 'improving' ? '#10b981' : entry.trend === 'declining' ? '#ef4444' : '#94a3b8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Top At-Risk Students" loading={loading}>
          {riskScores.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No risk scores available.</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {riskScores
                .filter((r) => ['critical', 'high'].includes(r.riskCategory))
                .slice(0, 8)
                .map((r) => (
                  <div key={r._id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{r.student?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{r.student?.studentId} · {r.student?.department}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${
                          r.riskCategory === 'critical' ? 'bg-red-500' :
                          r.riskCategory === 'high'     ? 'bg-orange-500' :
                          r.riskCategory === 'medium'   ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      >
                        {r.riskCategory.toUpperCase()}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">{(r.riskScore * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              {riskScores.filter((r) => ['critical', 'high'].includes(r.riskCategory)).length === 0 && (
                <p className="text-slate-400 text-sm text-center py-6">No high/critical risk students 🎉</p>
              )}
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}