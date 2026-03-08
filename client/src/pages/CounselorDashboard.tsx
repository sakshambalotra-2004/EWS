import React, { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────

type RiskCategory = 'critical' | 'high' | 'medium' | 'low';
type Trend        = 'improving' | 'stable' | 'declining';

interface RiskScore {
  _id:          string;
  riskScore:    number;
  riskCategory: RiskCategory;
  trend:        Trend;
  isReviewed:   boolean;
  createdAt:    string;
  student?: {
    _id:        string;
    name:       string;
    studentId:  string;
    department: string;
    semester:   number;
  };
  performance?: {
    gpa:                  number;
    attendancePercentage: number;
    semester:             number;
    academicYear:         string;
  };
}

interface Intervention {
  _id:    string;
  type:   string;
  status: string;
  title:  string;
}

interface AnalyticsData {
  totalStudents:    number;
  riskDistribution: { _id: RiskCategory; count: number }[];
  interventionStats: { _id: string; count: number }[];
}

// ── Constants ──────────────────────────────────────────────────────────────

const RISK_STYLES: Record<RiskCategory, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-amber-100 text-amber-700',
  low:      'bg-emerald-100 text-emerald-700',
};

const TREND_ICON: Record<Trend, string> = {
  improving: '📈',
  stable:    '➡️',
  declining: '📉',
};

// ── Sub-components ─────────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: RiskCategory }) {
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${RISK_STYLES[risk]}`}>
      {risk.toUpperCase()}
    </span>
  );
}

interface StatCardProps {
  icon: string; label: string; value: number | string;
  sub?: string; accent: 'blue' | 'red' | 'orange' | 'emerald' | 'purple';
}
const ACCENT: Record<StatCardProps['accent'], string> = {
  blue:    'bg-blue-50 text-blue-600',
  red:     'bg-red-50 text-red-600',
  orange:  'bg-orange-50 text-orange-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  purple:  'bg-purple-50 text-purple-600',
};
function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-4 ${ACCENT[accent]} border border-white shadow-sm`}>
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-0.5">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CounselorDashboard() {
  const [riskScores,    setRiskScores]    = useState<RiskScore[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [analytics,     setAnalytics]     = useState<AnalyticsData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [analyzing,     setAnalyzing]     = useState(false);
  const [analyzeMsg,    setAnalyzeMsg]    = useState<string | null>(null);
  const [reviewingId,   setReviewingId]   = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const getHeaders = (): HeadersInit => ({
    Authorization:  `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [riskRes, intRes, analRes] = await Promise.all([
        fetch(`${BASE_URL}/counselor/risk-scores`,  { headers: getHeaders() }),
        fetch(`${BASE_URL}/interventions`,           { headers: getHeaders() }),
        fetch(`${BASE_URL}/admin/analytics`,         { headers: getHeaders() }),
      ]);
      if (!riskRes.ok) throw new Error('Failed to fetch risk scores');
      const riskJson  = await riskRes.json();
      const intJson   = intRes.ok  ? await intRes.json()  : { interventions: [] };
      const analJson  = analRes.ok ? await analRes.json() : { data: null };

      setRiskScores((riskJson.analyses    ?? []) as RiskScore[]);
      setInterventions((intJson.interventions ?? []) as Intervention[]);
      setAnalytics(analJson.data as AnalyticsData | null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ── Analyze All ───────────────────────────────────────────────────────────

  const handleAnalyzeAll = async () => {
    setAnalyzing(true);
    setAnalyzeMsg(null);
    try {
      const res  = await fetch(`${BASE_URL}/counselor/analyze-all`, {
        method:  'POST',
        headers: getHeaders(),
        body:    JSON.stringify({ semester: 4, academicYear: '2024-25' }),
      });
      const data = await res.json();
      setAnalyzeMsg(`✅ Analysis complete — ${data.processed} students processed.`);
      fetchAll();
    } catch {
      setAnalyzeMsg('❌ Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Mark Reviewed ─────────────────────────────────────────────────────────

  const handleReview = async (analysisId: string) => {
    setReviewingId(analysisId);
    try {
      await fetch(`${BASE_URL}/counselor/review/${analysisId}`, {
        method: 'PUT', headers: getHeaders(),
      });
      setRiskScores((prev) =>
        prev.map((r) => r._id === analysisId ? { ...r, isReviewed: true } : r)
      );
    } catch {
      alert('Failed to mark as reviewed');
    } finally {
      setReviewingId(null);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const getCount = (cat: RiskCategory) =>
    analytics?.riskDistribution?.find((r) => r._id === cat)?.count ?? 0;

  const activeInterventions = interventions.filter((i) =>
    ['pending', 'in_progress'].includes(i.status)
  ).length;

  const atRisk    = riskScores.filter((r) => ['critical', 'high', 'medium'].includes(r.riskCategory));
  const unreviewed = riskScores.filter((r) => !r.isReviewed).length;

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Counselor Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Monitor at-risk students and manage interventions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            ↻ Refresh
          </button>
          <button
            onClick={handleAnalyzeAll}
            disabled={analyzing}
            className="text-xs px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition disabled:opacity-60"
          >
            {analyzing ? 'Analyzing...' : '🧠 Run Risk Analysis'}
          </button>
        </div>
      </div>

      {/* No risk data warning */}
      {riskScores.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Risk predictions not yet generated</p>
            <p className="text-amber-600 text-xs mt-0.5">Click "Run Risk Analysis" to start the AI analysis.</p>
          </div>
        </div>
      )}

      {/* Analyze feedback */}
      {analyzeMsg && (
        <div className={`p-4 rounded-xl text-sm ${analyzeMsg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {analyzeMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">⚠️ {error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard icon="👥" label="Total Students"   value={analytics?.totalStudents ?? riskScores.length} accent="blue"    />
        <StatCard icon="💀" label="Critical"          value={getCount('critical')}   accent="red"     />
        <StatCard icon="🔴" label="High Risk"         value={getCount('high')}       accent="orange"  />
        <StatCard icon="🟠" label="Medium Risk"       value={getCount('medium')}     accent="purple"  />
        <StatCard icon="💬" label="Active Cases"      value={activeInterventions}    sub="Interventions pending" accent="emerald" />
      </div>

      {/* Unreviewed banner */}
      {unreviewed > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 flex items-center justify-between">
          <p className="text-sm text-blue-700 font-medium">📋 {unreviewed} unreviewed risk analyses pending your review</p>
        </div>
      )}

      {/* At-Risk Students Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Students Requiring Attention ({atRisk.length})
          </h2>
        </div>

        {atRisk.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-12">
            {riskScores.length === 0 ? 'Run risk analysis to see results.' : '🎉 No at-risk students right now.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                {['Student', 'Dept', 'Semester', 'GPA', 'Attendance', 'Risk Score', 'Risk', 'Trend', 'Action'].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {atRisk.map((r) => (
                <tr key={r._id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${r.isReviewed ? 'opacity-60' : ''}`}>
                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-700">{r.student?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{r.student?.studentId}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{r.student?.department ?? '—'}</td>
                  <td className="py-3 px-3 text-slate-500">{r.student?.semester ?? '—'}</td>
                  <td className={`py-3 px-3 font-semibold ${
                    (r.performance?.gpa ?? 0) < 4 ? 'text-red-600' :
                    (r.performance?.gpa ?? 0) < 6 ? 'text-orange-500' : 'text-slate-700'
                  }`}>
                    {r.performance?.gpa ?? '—'}
                  </td>
                  <td className={`py-3 px-3 font-semibold ${
                    (r.performance?.attendancePercentage ?? 100) < 60 ? 'text-red-600' :
                    (r.performance?.attendancePercentage ?? 100) < 75 ? 'text-orange-500' : 'text-slate-700'
                  }`}>
                    {r.performance?.attendancePercentage != null ? `${r.performance.attendancePercentage}%` : '—'}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    {(r.riskScore * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge risk={r.riskCategory} />
                  </td>
                  <td className="py-3 px-3 text-base" title={r.trend}>
                    {TREND_ICON[r.trend]}
                  </td>
                  <td className="py-3 px-3">
                    {r.isReviewed ? (
                      <span className="text-xs text-slate-400">Reviewed</span>
                    ) : (
                      <button
                        onClick={() => handleReview(r._id)}
                        disabled={reviewingId === r._id}
                        className="text-xs px-3 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-medium transition disabled:opacity-50"
                      >
                        {reviewingId === r._id ? '...' : 'Mark Reviewed'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}