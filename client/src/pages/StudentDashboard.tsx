import React, { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────

type RiskCategory = 'critical' | 'high' | 'medium' | 'low';
type Trend        = 'improving' | 'stable' | 'declining';

interface Performance {
  _id:                  string;
  semester:             number;
  academicYear:         string;
  gpa:                  number;
  attendancePercentage: number;
  behaviorScore:        number;
  subjects:             { name: string; marksObtained: number; totalMarks: number }[];
}

interface RiskAnalysis {
  _id:          string;
  riskScore:    number;
  riskCategory: RiskCategory;
  trend:        Trend;
  explanation:  string;
  suggestions:  string[];
}

interface Intervention {
  _id:         string;
  type:        string;
  title:       string;
  status:      string;
  createdAt:   string;
  initiatedBy?: { name: string };
}

// ── Constants ──────────────────────────────────────────────────────────────

const RISK_BANNER: Record<RiskCategory, { bg: string; border: string; icon: string; text: string }> = {
  critical: { bg: 'bg-red-50',     border: 'border-red-200',    icon: '🚨', text: 'text-red-700'     },
  high:     { bg: 'bg-orange-50',  border: 'border-orange-200', icon: '⚠️', text: 'text-orange-700'  },
  medium:   { bg: 'bg-amber-50',   border: 'border-amber-200',  icon: '📋', text: 'text-amber-700'   },
  low:      { bg: 'bg-emerald-50', border: 'border-emerald-200',icon: '🌟', text: 'text-emerald-700' },
};

const RISK_BADGE: Record<RiskCategory, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-amber-100 text-amber-700',
  low:      'bg-emerald-100 text-emerald-700',
};

const TREND_ICON: Record<Trend, string> = {
  improving: '📈', stable: '➡️', declining: '📉',
};

const INTERVENTION_ICON: Record<string, string> = {
  meeting: '🤝', alert: '🔔', remedial_class: '📚', counseling: '💬', notification: '📣',
};

const STATUS_STYLE: Record<string, string> = {
  pending:     'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-slate-100 text-slate-500',
};

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor(diff / 3600000);
  if (days > 0) return `${days}d ago`;
  if (hrs  > 0) return `${hrs}h ago`;
  return 'Just now';
};

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent }: {
  icon: string; label: string; value: string | number; sub: string;
  accent: 'blue' | 'red' | 'orange' | 'emerald' | 'purple';
}) {
  const ACCENT: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600', red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600', emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className={`rounded-2xl p-4 ${ACCENT[accent]} border border-white shadow-sm`}>
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-0.5">{value}</p>
      <p className="text-xs opacity-60 mt-1">{sub}</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const [performance,   setPerformance]   = useState<Performance | null>(null);
  const [riskAnalysis,  setRiskAnalysis]  = useState<RiskAnalysis | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  const name   = localStorage.getItem('name')   ?? 'Student';
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => { fetchAll(); }, []);

  const getHeaders = (): HeadersInit => ({
    Authorization:  `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [perfRes, riskRes, intRes] = await Promise.all([
        fetch(`${BASE_URL}/student/my-performance`,  { headers: getHeaders() }),
        fetch(`${BASE_URL}/student/my-risk`,         { headers: getHeaders() }),
        fetch(`${BASE_URL}/student/my-interventions`,{ headers: getHeaders() }),
      ]);

      if (!perfRes.ok) throw new Error('Failed to load performance data');
      const perfJson = await perfRes.json();
      const riskJson = riskRes.ok ? await riskRes.json() : { analysis: null };
      const intJson  = intRes.ok  ? await intRes.json()  : { interventions: [] };

      // Latest performance record
      const records = (perfJson.records ?? []) as Performance[];
      setPerformance(records[0] ?? null);
      setRiskAnalysis(riskJson.analysis as RiskAnalysis | null);
      setInterventions(((intJson.interventions ?? []) as Intervention[]).slice(0, 5));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────

  const failedSubjects = performance?.subjects?.filter(
    (s) => (s.marksObtained / s.totalMarks) * 100 < 50
  ).length ?? 0;

  const banner = riskAnalysis ? RISK_BANNER[riskAnalysis.riskCategory] : null;

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

      {/* Welcome header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {name} 👋</h1>
          <p className="text-slate-500 text-sm">
            {performance
              ? `Semester ${performance.semester} · ${performance.academicYear}`
              : 'No performance data yet'}
          </p>
        </div>
        {riskAnalysis && (
          <div className="ml-auto flex items-center gap-2">
            <span className={`px-3 py-1 rounded-xl text-sm font-bold ${RISK_BADGE[riskAnalysis.riskCategory]}`}>
              {riskAnalysis.riskCategory.toUpperCase()} RISK
            </span>
            <span className="text-base" title={riskAnalysis.trend}>
              {TREND_ICON[riskAnalysis.trend]}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">⚠️ {error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon="📊" label="Current GPA"
          value={performance?.gpa ?? '—'}
          sub="Out of 10.0"
          accent="blue"
        />
        <StatCard
          icon="📅" label="Attendance"
          value={performance ? `${performance.attendancePercentage}%` : '—'}
          sub="Minimum: 75%"
          accent={(performance?.attendancePercentage ?? 100) < 75 ? 'red' : 'emerald'}
        />
        <StatCard
          icon="📚" label="Failed Subjects"
          value={failedSubjects}
          sub="Below 50% marks"
          accent={failedSubjects > 0 ? 'red' : 'emerald'}
        />
        <StatCard
          icon="🎯" label="Risk Score"
          value={riskAnalysis ? `${(riskAnalysis.riskScore * 100).toFixed(0)}%` : '—'}
          sub={riskAnalysis ? `Trend: ${riskAnalysis.trend}` : 'Not yet analyzed'}
          accent={
            !riskAnalysis                              ? 'blue'    :
            riskAnalysis.riskScore > 0.7               ? 'red'     :
            riskAnalysis.riskScore > 0.4               ? 'orange'  : 'emerald'
          }
        />
      </div>

      {/* Risk banner + explanation */}
      {riskAnalysis && banner && (
        <div className={`rounded-2xl p-4 border ${banner.bg} ${banner.border} flex gap-3 items-start`}>
          <span className="text-2xl">{banner.icon}</span>
          <div>
            <p className={`font-semibold text-sm ${banner.text}`}>
              {riskAnalysis.riskCategory === 'low'
                ? "You're on track — keep it up!"
                : riskAnalysis.riskCategory === 'medium'
                ? 'Some areas need attention'
                : riskAnalysis.riskCategory === 'high'
                ? 'High risk — please speak to your counselor'
                : '🚨 Critical — immediate academic support needed'}
            </p>
            {riskAnalysis.explanation && (
              <p className={`text-xs mt-1 opacity-80 ${banner.text}`}>{riskAnalysis.explanation}</p>
            )}
          </div>
        </div>
      )}

      {/* AI Recommendations + Subjects in two cols */}
      <div className="grid grid-cols-2 gap-5">

        {/* AI suggestions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">AI Recommendations</h2>
          {!riskAnalysis ? (
            <p className="text-slate-400 text-sm text-center py-6">Risk analysis not yet run for you.</p>
          ) : riskAnalysis.suggestions.length === 0 ? (
            <div className="flex gap-3 items-start p-3 bg-emerald-50 rounded-xl">
              <span className="text-xl">🌟</span>
              <p className="text-sm font-medium text-emerald-800">
                You're doing great! Keep maintaining your attendance and study routine.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {riskAnalysis.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Subject performance */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
            Subject Performance
          </h2>
          {!performance?.subjects?.length ? (
            <p className="text-slate-400 text-sm text-center py-6">No subject data yet.</p>
          ) : (
            <div className="space-y-3">
              {performance.subjects.map((s, i) => {
                const pct = Math.round((s.marksObtained / s.totalMarks) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span className="truncate max-w-[160px]">{s.name}</span>
                      <span className={`font-semibold ${pct < 50 ? 'text-red-600' : pct < 65 ? 'text-orange-500' : 'text-slate-700'}`}>
                        {s.marksObtained}/{s.totalMarks}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${pct < 50 ? 'bg-red-500' : pct < 65 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active interventions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
          My Support Actions ({interventions.length})
        </h2>
        {interventions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No interventions assigned to you yet.</p>
        ) : (
          <div className="space-y-2">
            {interventions.map((iv) => (
              <div key={iv._id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{INTERVENTION_ICON[iv.type] ?? '📋'}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{iv.title}</p>
                    <p className="text-xs text-slate-400">
                      {timeAgo(iv.createdAt)}
                      {iv.initiatedBy && ` · By ${iv.initiatedBy.name}`}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${STATUS_STYLE[iv.status] ?? 'bg-slate-100 text-slate-500'}`}>
                  {iv.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}