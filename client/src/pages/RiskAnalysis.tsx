import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BASE_URL = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────

type RiskCategory = 'critical' | 'high' | 'medium' | 'low';
type Trend        = 'improving' | 'stable' | 'declining';
type BarColor     = 'emerald' | 'red' | 'orange' | 'blue' | 'amber';

interface RiskScore {
  _id:                string;
  riskScore:          number;
  riskCategory:       RiskCategory;
  trend:              Trend;
  isReviewed:         boolean;
  explanation:        string;
  suggestions:        string[];
  featureContributions?: {
    gpa:        number;
    attendance: number;
    behavior:   number;
    marks:      number;
  };
  createdAt: string;
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
    behaviorScore:        number;
    subjects:             { name: string; marksObtained: number; totalMarks: number }[];
  };
}

interface RiskHistory {
  riskScore:    number;
  riskCategory: RiskCategory;
  createdAt:    string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const RISK_STYLES: Record<RiskCategory, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-amber-100 text-amber-700 border-amber-200',
  low:      'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const RISK_TEXT: Record<RiskCategory, string> = {
  critical: 'text-red-600',
  high:     'text-orange-500',
  medium:   'text-amber-500',
  low:      'text-emerald-500',
};

const TREND_ICON: Record<Trend, string> = {
  improving: '📈',
  stable:    '➡️',
  declining: '📉',
};

// ── Sub-components ─────────────────────────────────────────────────────────

function ProgressBar({ label, value, color = 'emerald' }: { label: string; value: number; color?: BarColor }) {
  const bars: Record<BarColor, string> = {
    emerald: 'bg-emerald-500',
    red:     'bg-red-500',
    orange:  'bg-orange-500',
    blue:    'bg-blue-500',
    amber:   'bg-amber-500',
  };
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`${bars[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: RiskCategory }) {
  return (
    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${RISK_STYLES[risk]}`}>
      {risk.toUpperCase()}
    </span>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

const attColor  = (v: number): BarColor => v < 60 ? 'red' : v < 75 ? 'orange' : 'emerald';
const gpaColor  = (v: number): BarColor => v < 4   ? 'red' : v < 6  ? 'orange' : 'emerald';
const riskColor = (v: number): BarColor => v > 0.7 ? 'red' : v > 0.5 ? 'orange' : v > 0.3 ? 'amber' : 'emerald';

// ── Main Component ─────────────────────────────────────────────────────────

export default function RiskAnalysis() {
  const [riskScores,  setRiskScores]  = useState<RiskScore[]>([]);
  const [selected,    setSelected]    = useState<RiskScore | null>(null);
  const [history,     setHistory]     = useState<RiskHistory[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [filterCat,   setFilterCat]   = useState<string>('all');
  const [filterTrend, setFilterTrend] = useState<string>('all');
  const [search,      setSearch]      = useState('');
  const [analyzing,   setAnalyzing]   = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => { fetchRiskScores(); }, []);

  useEffect(() => {
    if (selected?.student?._id) fetchHistory(selected.student._id);
  }, [selected]);

  const getHeaders = (): HeadersInit => ({
    Authorization:  `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchRiskScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterCat   !== 'all') params.set('category', filterCat);
      if (filterTrend !== 'all') params.set('trend',    filterTrend);

      const res  = await fetch(`${BASE_URL}/counselor/risk-scores?${params}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch risk scores');
      const data = await res.json();
      const scores = (data.analyses ?? []) as RiskScore[];
      setRiskScores(scores.sort((a, b) => b.riskScore - a.riskScore));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (studentId: string) => {
    try {
      const res  = await fetch(`${BASE_URL}/counselor/student/${studentId}/history`, { headers: getHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setHistory((data.history ?? []) as RiskHistory[]);
    } catch {
      setHistory([]);
    }
  };

  const handleAnalyzeAll = async () => {
    setAnalyzing(true);
    try {
      const res  = await fetch(`${BASE_URL}/counselor/analyze-all`, {
        method: 'POST', headers: getHeaders(),
        body:   JSON.stringify({ semester: 4, academicYear: '2024-25' }),
      });
      const data = await res.json();
      alert(`✅ Analysis complete — ${data.processed} students processed.`);
      fetchRiskScores();
    } catch {
      alert('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReview = async (id: string) => {
    setReviewingId(id);
    try {
      await fetch(`${BASE_URL}/counselor/review/${id}`, { method: 'PUT', headers: getHeaders() });
      setRiskScores((prev) => prev.map((r) => r._id === id ? { ...r, isReviewed: true } : r));
      if (selected?._id === id) setSelected((s) => s ? { ...s, isReviewed: true } : s);
    } finally {
      setReviewingId(null);
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = riskScores.filter((r) => {
    const matchCat    = filterCat   === 'all' || r.riskCategory === filterCat;
    const matchTrend  = filterTrend === 'all' || r.trend        === filterTrend;
    const matchSearch = !search ||
      r.student?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.student?.studentId?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchTrend && matchSearch;
  });

  // ── Render ────────────────────────────────────────────────────────────────

  if (!loading && riskScores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3 p-6">
        <div className="text-5xl">🔒</div>
        <p className="text-slate-600 font-semibold">No risk analysis data yet</p>
        <p className="text-slate-400 text-sm">Run AI prediction first to unlock risk analysis</p>
        <button
          onClick={handleAnalyzeAll}
          disabled={analyzing}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60"
        >
          {analyzing ? 'Analyzing...' : '🚀 Run Analysis Now'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Risk Analysis</h1>
        <div className="flex gap-2">
          <button onClick={fetchRiskScores} className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">↻</button>
          <button
            onClick={handleAnalyzeAll}
            disabled={analyzing}
            className="text-xs px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition disabled:opacity-60"
          >
            {analyzing ? 'Analyzing...' : '🧠 Re-run Analysis'}
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">⚠️ {error}</div>}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 w-48"
        />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          aria-label="Filter by risk category"
          title="Filter by risk category"
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
        >
          <option value="all">All Categories</option>
          {(['critical', 'high', 'medium', 'low'] as RiskCategory[]).map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select
          value={filterTrend}
          onChange={(e) => setFilterTrend(e.target.value)}
          aria-label="Filter by trend"
          title="Filter by trend"
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
        >
          <option value="all">All Trends</option>
          <option value="improving">📈 Improving</option>
          <option value="stable">➡️ Stable</option>
          <option value="declining">📉 Declining</option>
        </select>
        <p className="text-xs text-slate-400 self-center ml-auto">{filtered.length} of {riskScores.length} students</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-5 gap-5">

        {/* Student list */}
        <div className="col-span-2 space-y-2 max-h-[75vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.map((r) => (
            <div
              key={r._id}
              onClick={() => setSelected(r)}
              className={`p-3 rounded-xl cursor-pointer transition-all border shadow-sm ${
                selected?._id === r._id
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {r.student?.name?.split(' ').map((n) => n[0]).join('') ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-700 text-sm truncate">{r.student?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-slate-400">{r.student?.department} · {r.student?.studentId}</p>
                </div>
                <div className="text-right shrink-0">
                  <RiskBadge risk={r.riskCategory} />
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <span className="text-xs text-slate-400">{(r.riskScore * 100).toFixed(0)}%</span>
                    <span className="text-xs" title={r.trend}>{TREND_ICON[r.trend]}</span>
                    {r.isReviewed && <span className="text-xs text-emerald-500" title="Reviewed">✓</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="col-span-3">
          {selected ? (
            <div className="space-y-4">

              {/* Profile header */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                    {selected.student?.name?.split(' ').map((n) => n[0]).join('') ?? '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-lg">{selected.student?.name}</p>
                    <p className="text-sm text-slate-400">
                      {selected.student?.studentId} · {selected.student?.department} · Sem {selected.student?.semester}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <RiskBadge risk={selected.riskCategory} />
                      <span className="text-xs text-slate-500">{TREND_ICON[selected.trend]} {selected.trend}</span>
                      {!selected.isReviewed && (
                        <button
                          onClick={() => handleReview(selected._id)}
                          disabled={reviewingId === selected._id}
                          className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50"
                        >
                          {reviewingId === selected._id ? '...' : 'Mark Reviewed'}
                        </button>
                      )}
                      {selected.isReviewed && <span className="text-xs text-emerald-500 font-medium">✓ Reviewed</span>}
                    </div>
                  </div>
                  <div className="text-center shrink-0">
                    <p className={`text-4xl font-black ${RISK_TEXT[selected.riskCategory]}`}>
                      {(selected.riskScore * 100).toFixed(0)}
                    </p>
                    <p className="text-xs text-slate-400">Risk Score</p>
                  </div>
                </div>
                {selected.explanation && (
                  <p className="mt-4 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">{selected.explanation}</p>
                )}
              </div>

              {/* Progress bars */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Contributing Factors</h4>
                <div className="space-y-3">
                  <ProgressBar
                    label="Attendance Rate"
                    value={selected.performance?.attendancePercentage ?? 0}
                    color={attColor(selected.performance?.attendancePercentage ?? 0)}
                  />
                  <ProgressBar
                    label="GPA Health (0–10 scale)"
                    value={(selected.performance?.gpa ?? 0) * 10}
                    color={gpaColor(selected.performance?.gpa ?? 0)}
                  />
                  <ProgressBar
                    label="Behavior Score"
                    value={((selected.performance?.behaviorScore ?? 0) / 5) * 100}
                    color="blue"
                  />
                  <ProgressBar
                    label="Overall Academic Risk"
                    value={selected.riskScore * 100}
                    color={riskColor(selected.riskScore)}
                  />
                </div>
              </div>

              {/* Feature contributions */}
              {selected.featureContributions && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Risk Factor Breakdown</h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {Object.entries(selected.featureContributions).map(([key, val]) => (
                      <div key={key} className="bg-slate-50 rounded-xl p-3">
                        <p className="text-slate-400 capitalize">{key}</p>
                        <p className="font-bold text-lg text-slate-700 mt-0.5">{(val * 100).toFixed(0)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject marks */}
              {(selected.performance?.subjects?.length ?? 0) > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Subject Marks</h4>
                  <div className="space-y-2">
                    {selected.performance!.subjects.map((s, i) => {
                      const pct = Math.round((s.marksObtained / s.totalMarks) * 100);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <p className="text-xs text-slate-600 w-40 truncate">{s.name}</p>
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${pct < 50 ? 'bg-red-500' : pct < 65 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className={`text-xs font-semibold w-10 text-right ${pct < 50 ? 'text-red-600' : pct < 65 ? 'text-orange-500' : 'text-slate-600'}`}>
                            {pct}%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Risk history chart */}
              {history.length > 1 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Risk Score History</h4>
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={history.slice().reverse().map((h, i) => ({ label: `#${i + 1}`, score: +(h.riskScore * 100).toFixed(1) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip formatter={(v: number) => `${v}%`} />
                      <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* AI suggestions */}
              {selected.suggestions?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Recommendations</h4>
                  <ul className="space-y-2">
                    {selected.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-2 bg-white rounded-2xl border border-slate-100">
              <span className="text-4xl">👈</span>
              <p className="font-medium text-sm">Select a student to view their risk profile</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}