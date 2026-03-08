import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BASE_URL = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface Subject {
  name:          string;
  marksObtained: number;
  totalMarks:    number;
  grade?:        string;
}

interface Performance {
  _id:                  string;
  semester:             number;
  academicYear:         string;
  gpa:                  number;
  attendancePercentage: number;
  behaviorScore:        number;
  subjects:             Subject[];
  createdAt:            string;
}

interface RiskAnalysis {
  riskScore:    number;
  riskCategory: 'critical' | 'high' | 'medium' | 'low';
  trend:        'improving' | 'stable' | 'declining';
  suggestions:  string[];
  explanation:  string;
}

interface GpaTrend {
  sem:  string;
  gpa:  number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const GRADE_COLOR: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-700',
  'A':  'bg-emerald-100 text-emerald-700',
  'A-': 'bg-emerald-100 text-emerald-700',
  'B+': 'bg-blue-100 text-blue-700',
  'B':  'bg-blue-100 text-blue-700',
  'B-': 'bg-blue-100 text-blue-700',
  'C':  'bg-amber-100 text-amber-700',
  'D':  'bg-orange-100 text-orange-700',
  'F':  'bg-red-100 text-red-700',
};

// ── Sub-components ─────────────────────────────────────────────────────────

function ProgressBar({ label, value, color = 'emerald' }: { label: string; value: number; color?: string }) {
  const bar: Record<string, string> = {
    emerald: 'bg-emerald-500',
    red:     'bg-red-500',
    blue:    'bg-blue-500',
    amber:   'bg-amber-500',
  };
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`${bar[color] ?? bar.emerald} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Card({ title, children, loading }: { title?: string; children: React.ReactNode; loading?: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      {title && <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">{title}</h2>}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

const computeGrade = (obtained: number, total: number): string => {
  const pct = (obtained / total) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 85) return 'A';
  if (pct >= 80) return 'A-';
  if (pct >= 75) return 'B+';
  if (pct >= 70) return 'B';
  if (pct >= 65) return 'B-';
  if (pct >= 55) return 'C';
  if (pct >= 45) return 'D';
  return 'F';
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function MyProgress() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const getHeaders = (): HeadersInit => ({
    Authorization:  `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [perfRes, riskRes] = await Promise.all([
        fetch(`${BASE_URL}/student/my-performance`, { headers: getHeaders() }),
        fetch(`${BASE_URL}/student/my-risk`,        { headers: getHeaders() }),
      ]);
      if (!perfRes.ok) throw new Error('Failed to fetch performance data');
      const perfJson = await perfRes.json();
      const riskJson = riskRes.ok ? await riskRes.json() : { analysis: null };

      setPerformances((perfJson.records   ?? []) as Performance[]);
      setRiskAnalysis(riskJson.analysis as RiskAnalysis | null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  // Latest performance record
  const latest = performances[0] ?? null;

  // GPA trend across semesters
  const gpaTrend: GpaTrend[] = performances
    .slice()
    .sort((a, b) => a.semester - b.semester)
    .map((p) => ({ sem: `Sem ${p.semester}`, gpa: p.gpa }));

  // Subjects from latest semester
  const subjects = latest?.subjects ?? [];

  // GPA health as percentage (0–10 scale)
  const gpaHealth = latest ? Math.round((latest.gpa / 10) * 100) : 0;

  // Attendance color
  const attColor = (latest?.attendancePercentage ?? 100) < 75 ? 'red' :
                   (latest?.attendancePercentage ?? 100) < 85 ? 'amber' : 'emerald';

  // Risk badge
  const RISK_STYLE: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high:     'bg-orange-100 text-orange-700',
    medium:   'bg-amber-100 text-amber-700',
    low:      'bg-emerald-100 text-emerald-700',
  };

  const TREND_ICON: Record<string, string> = {
    improving: '📈',
    stable:    '➡️',
    declining: '📉',
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-2xl text-sm">
        ⚠️ {error}
        <button onClick={fetchAll} className="ml-3 underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">My Progress</h1>
        <button onClick={fetchAll} className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          ↻ Refresh
        </button>
      </div>

      {/* Risk summary banner */}
      {riskAnalysis && (
        <div className={`rounded-2xl p-4 border flex items-start gap-4 ${
          riskAnalysis.riskCategory === 'critical' ? 'bg-red-50 border-red-200' :
          riskAnalysis.riskCategory === 'high'     ? 'bg-orange-50 border-orange-200' :
          riskAnalysis.riskCategory === 'medium'   ? 'bg-amber-50 border-amber-200' :
          'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="text-3xl">{TREND_ICON[riskAnalysis.trend]}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${RISK_STYLE[riskAnalysis.riskCategory]}`}>
                {riskAnalysis.riskCategory.toUpperCase()} RISK
              </span>
              <span className="text-sm font-semibold text-slate-700">
                Score: {(riskAnalysis.riskScore * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-slate-600">{riskAnalysis.explanation}</p>
          </div>
        </div>
      )}

      {/* GPA Trend + Academic Metrics */}
      <div className="grid grid-cols-2 gap-5">
        <Card title="GPA Trend" loading={loading}>
          {gpaTrend.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No GPA data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={gpaTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="sem" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip formatter={(v: number) => v.toFixed(1)} />
                <Line
                  type="monotone" dataKey="gpa" stroke="#10b981"
                  strokeWidth={3} dot={{ r: 4, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Academic Metrics" loading={loading}>
          <div className="space-y-4 mt-2">
            <ProgressBar
              label="Attendance"
              value={latest?.attendancePercentage ?? 0}
              color={attColor}
            />
            <ProgressBar
              label="GPA Health"
              value={gpaHealth}
              color={gpaHealth < 40 ? 'red' : gpaHealth < 60 ? 'amber' : 'emerald'}
            />
            <ProgressBar
              label="Behavior Score"
              value={latest ? Math.round((latest.behaviorScore / 5) * 100) : 0}
              color="blue"
            />
            {riskAnalysis && (
              <ProgressBar
                label="Risk Level (lower is better)"
                value={Math.round(riskAnalysis.riskScore * 100)}
                color={riskAnalysis.riskScore > 0.6 ? 'red' : riskAnalysis.riskScore > 0.4 ? 'amber' : 'emerald'}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Course Grades */}
      <Card title={`Subject Grades — Semester ${latest?.semester ?? ''} (${latest?.academicYear ?? ''})`} loading={loading}>
        {subjects.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No subject data available for this semester.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Subject', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => {
                const pct   = Math.round((s.marksObtained / s.totalMarks) * 100);
                const grade = s.grade ?? computeGrade(s.marksObtained, s.totalMarks);
                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-700">{s.name}</td>
                    <td className="py-3 px-3 text-slate-600">{s.marksObtained}</td>
                    <td className="py-3 px-3 text-slate-400">{s.totalMarks}</td>
                    <td className={`py-3 px-3 font-semibold ${pct < 50 ? 'text-red-600' : pct < 65 ? 'text-orange-500' : 'text-slate-700'}`}>
                      {pct}%
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${GRADE_COLOR[grade] ?? 'bg-slate-100 text-slate-600'}`}>
                        {grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Suggestions from AI */}
      {riskAnalysis?.suggestions && riskAnalysis.suggestions.length > 0 && (
        <Card title="AI Recommendations">
          <ul className="space-y-2">
            {riskAnalysis.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-emerald-500 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

    </div>
  );
}