import React, { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────

type RiskCategory = 'critical' | 'high' | 'medium' | 'low';

interface Student {
  _id:        string;
  name:       string;
  studentId:  string;
  department: string;
  semester:   number;
}

interface Performance {
  _id:          string;
  student:      Student;
  gpa:          number;
  attendancePercentage: number;
  behaviorScore: number;
  semester:     number;
  academicYear: string;
  riskCategory?: RiskCategory;
}

type Ratings = Record<string, { participation: number; attention: number; discipline: number }>;

// ── Constants ──────────────────────────────────────────────────────────────

const CRITERIA: { key: 'participation' | 'attention' | 'discipline'; label: string; icon: string }[] = [
  { key: 'participation', label: 'Participation', icon: '🙋' },
  { key: 'attention',     label: 'Attention',     icon: '👁️' },
  { key: 'discipline',    label: 'Discipline',    icon: '📐' },
];

const RISK_STYLES: Record<RiskCategory, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-amber-100 text-amber-700',
  low:      'bg-emerald-100 text-emerald-700',
};

// ── Sub-components ─────────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk?: RiskCategory }) {
  if (!risk) return null;
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${RISK_STYLES[risk]}`}>
      {risk.toUpperCase()}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function BehaviorRating() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [ratings,      setRatings]      = useState<Ratings>({});
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState<string | null>(null);

  // Filter state
  const [semester,     setSemester]     = useState('');
  const [academicYear, setAcademicYear] = useState('2024-25');

  useEffect(() => { fetchPerformances(); }, []);

  const getHeaders = (): HeadersInit => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  // ── Fetch performances ────────────────────────────────────────────────────

  const fetchPerformances = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (semester)     params.set('semester',     semester);
      if (academicYear) params.set('academicYear', academicYear);

      const res  = await fetch(`${BASE_URL}/faculty/students?${params.toString()}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch student performances');
      const data = await res.json();

      const perfs = (data.performances ?? []) as Performance[];
      setPerformances(perfs);

      // Pre-fill ratings from existing behaviorScore (1-5 mapped to sliders)
      const initial: Ratings = {};
      perfs.forEach((p) => {
        const base = Math.round(((p.behaviorScore ?? 3) / 5) * 10);
        initial[p._id] = { participation: base, attention: base, discipline: base };
      });
      setRatings(initial);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ── Slider helpers ────────────────────────────────────────────────────────

  const getR = (perfId: string, key: keyof Ratings[string]) =>
    ratings[perfId]?.[key] ?? 5;

  const setR = (perfId: string, key: keyof Ratings[string], val: number) =>
    setRatings((r) => ({ ...r, [perfId]: { ...(r[perfId] ?? { participation: 5, attention: 5, discipline: 5 }), [key]: val } }));

  // Average of 3 criteria → map to 1-5 behavior score
  const computeBehaviorScore = (perfId: string): number => {
    const r = ratings[perfId];
    if (!r) return 3;
    const avg = (r.participation + r.attention + r.discipline) / 3;
    return Math.max(1, Math.min(5, Math.round(avg / 2)));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const results: { perfId: string; status: string }[] = [];

    for (const perf of performances) {
      const behaviorScore = computeBehaviorScore(perf._id);
      const remarks = `Participation: ${getR(perf._id, 'participation')}/10, `
                    + `Attention: ${getR(perf._id, 'attention')}/10, `
                    + `Discipline: ${getR(perf._id, 'discipline')}/10`;
      try {
        const res = await fetch(`${BASE_URL}/faculty/behavioral/${perf._id}`, {
          method:  'PUT',
          headers: getHeaders(),
          body:    JSON.stringify({ behaviorScore, remarks }),
        });
        results.push({ perfId: perf._id, status: res.ok ? 'ok' : 'failed' });
      } catch {
        results.push({ perfId: perf._id, status: 'error' });
      }
    }

    const failed = results.filter((r) => r.status !== 'ok').length;
    if (failed === 0) {
      setSuccess(`✅ Behavior ratings submitted for ${performances.length} students.`);
    } else {
      setError(`⚠️ ${failed} submissions failed. Please retry.`);
    }
    setSubmitting(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Behavior Rating</h1>
        <p className="text-slate-500 text-sm mt-0.5">Rate students on behavior indicators (1–10 scale)</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div>
          <label htmlFor="semester-filter" className="text-xs text-slate-500 font-medium">Semester</label>
          <input
            id="semester-filter"
            type="number" min={1} max={8}
            value={semester}
            placeholder="All"
            onChange={(e) => setSemester(e.target.value)}
            className="block border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 w-28 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div>
          <label htmlFor="year-filter" className="text-xs text-slate-500 font-medium">Academic Year</label>
          <input
            id="year-filter"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="block border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 w-32 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchPerformances}
            className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            Load Students
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error   && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
      {success && <div className="p-4 bg-emerald-50 text-emerald-700 text-sm rounded-xl">{success}</div>}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : performances.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          No student performances found. Upload a CSV first or adjust filters.
        </div>
      ) : (
        <div className="space-y-4">
          {performances.map((perf) => (
            <div key={perf._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">

              {/* Student header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {perf.student?.name?.split(' ').map((n) => n[0]).join('') ?? '?'}
                </div>
                <div>
                  <p className="font-semibold text-slate-700">{perf.student?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-slate-400">
                    {perf.student?.studentId} · {perf.student?.department} · Sem {perf.student?.semester}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="text-right text-xs text-slate-400">
                    <p>GPA: <span className="font-semibold text-slate-600">{perf.gpa}</span></p>
                    <p>Att: <span className="font-semibold text-slate-600">{perf.attendancePercentage}%</span></p>
                  </div>
                  <RiskBadge risk={perf.riskCategory} />
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-3 gap-5">
                {CRITERIA.map(({ key, label, icon }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500">{icon} {label}</span>
                      <span className="text-sm font-bold text-emerald-600">{getR(perf._id, key)}/10</span>
                    </div>
                    <input
                      type="range"
                      min={1} max={10}
                      value={getR(perf._id, key)}
                      aria-label={`${label} rating for ${perf.student?.name}`}
                      onChange={(e) => setR(perf._id, key, Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-slate-300 mt-0.5">
                      <span>1</span><span>10</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Computed score preview */}
              <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                <span>Computed behavior score</span>
                <span className="font-bold text-slate-600">{computeBehaviorScore(perf._id)} / 5</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit */}
      {performances.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60"
        >
          {submitting ? `Submitting... (${performances.length} students)` : `Submit Behavior Ratings (${performances.length} students)`}
        </button>
      )}

    </div>
  );
}