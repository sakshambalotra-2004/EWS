import React, { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────

type RiskCategory = 'critical' | 'high' | 'medium' | 'low';

interface Performance {
  _id:                  string;
  semester:             number;
  academicYear:         string;
  gpa:                  number;
  attendancePercentage: number;
  behaviorScore:        number;
  createdAt:            string;
  updatedAt:            string;
  student?: {
    name:       string;
    studentId:  string;
    department: string;
  };
  riskCategory?: RiskCategory;
}

interface RiskScore {
  _id:          string;
  riskCategory: RiskCategory;
  riskScore:    number;
  student?: { name: string; studentId: string; department: string };
}

// ── Sub-components ─────────────────────────────────────────────────────────

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

function Card({ title, children, loading }: { title: string; children: React.ReactNode; loading?: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">{title}</h2>
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0)  return `${days} day${days  > 1 ? 's' : ''} ago`;
  if (hours > 0)  return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (mins  > 0)  return `${mins} min${mins  > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const RISK_BADGE: Record<RiskCategory, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-amber-100 text-amber-700',
  low:      'bg-emerald-100 text-emerald-700',
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function FacultyDashboard() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [riskScores,   setRiskScores]   = useState<RiskScore[]>([]);
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
        fetch(`${BASE_URL}/faculty/students`,          { headers: getHeaders() }),
        fetch(`${BASE_URL}/counselor/risk-scores`,     { headers: getHeaders() }),
      ]);

      if (!perfRes.ok) throw new Error('Failed to fetch student data');
      const perfJson = await perfRes.json();
      const riskJson = riskRes.ok ? await riskRes.json() : { analyses: [] };

      setPerformances((perfJson.performances ?? []) as Performance[]);
      setRiskScores((riskJson.analyses       ?? []) as RiskScore[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────

  // Unique semesters uploaded = proxy for "courses"
  const uniqueSemesters = [...new Set(performances.map((p) => p.semester))];

  // Unique students across all performances
  const uniqueStudents  = [...new Set(performances.map((p) => p.student?.studentId).filter(Boolean))];

  // Flagged = high or critical risk
  const flaggedStudents = riskScores.filter((r) =>
    ['critical', 'high'].includes(r.riskCategory)
  );

  // Performances that have no behavior score set (behaviorScore = default 3)
  const noBehaviorSet = performances.filter((p) => !p.behaviorScore || p.behaviorScore === 3);

  // Recent activity feed — derived from real upload/update timestamps
  interface Activity { icon: string; text: string; time: string; sortKey: number }
  const activity: Activity[] = [];

  // Group performances by academicYear+semester as "uploads"
  const uploadGroups = new Map<string, { semester: number; academicYear: string; count: number; date: string }>();
  performances.forEach((p) => {
    const key = `${p.semester}-${p.academicYear}`;
    if (!uploadGroups.has(key)) {
      uploadGroups.set(key, { semester: p.semester, academicYear: p.academicYear, count: 0, date: p.createdAt });
    }
    uploadGroups.get(key)!.count++;
  });
  uploadGroups.forEach(({ semester, academicYear, count, date }) => {
    activity.push({
      icon:    '📤',
      text:    `Uploaded marks for ${count} student${count > 1 ? 's' : ''} — Semester ${semester} (${academicYear})`,
      time:    timeAgo(date),
      sortKey: new Date(date).getTime(),
    });
  });

  // Behavior ratings submitted
  const ratedPerfs = performances.filter((p) => p.behaviorScore && p.behaviorScore !== 3);
  if (ratedPerfs.length > 0) {
    const latest = ratedPerfs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
    activity.push({
      icon:    '⭐',
      text:    `Behavior ratings submitted for ${ratedPerfs.length} student${ratedPerfs.length > 1 ? 's' : ''}`,
      time:    timeAgo(latest.updatedAt),
      sortKey: new Date(latest.updatedAt).getTime(),
    });
  }

  // Pending behavior ratings
  if (noBehaviorSet.length > 0) {
    activity.push({
      icon:    '📋',
      text:    `${noBehaviorSet.length} student${noBehaviorSet.length > 1 ? 's' : ''} missing behavior rating`,
      time:    'Action needed',
      sortKey: 0,
    });
  }

  const sortedActivity = activity.sort((a, b) => b.sortKey - a.sortKey).slice(0, 5);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage marks and student behavior</p>
        </div>
        <button
          onClick={fetchAll}
          className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">⚠️ {error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="📚" label="Semesters Uploaded" value={uniqueSemesters.length}  sub="CSV data uploaded"      accent="blue"    />
        <StatCard icon="👥" label="My Students"        value={uniqueStudents.length}   sub="Across all uploads"     accent="emerald" />
        <StatCard icon="⚠️" label="Flagged Students"   value={flaggedStudents.length}  sub="High / Critical risk"   accent="orange"  />
        <StatCard icon="📋" label="Pending Ratings"    value={noBehaviorSet.length}    sub="Behavior score missing" accent="purple"  />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-5">

        {/* Recent Activity */}
        <Card title="Recent Activity" loading={loading}>
          {sortedActivity.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No activity yet. Upload a CSV to get started.</p>
          ) : (
            <div className="space-y-3">
              {sortedActivity.map(({ icon, text, time }, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <p className="text-sm text-slate-700 font-medium">{text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Flagged Students */}
        <Card title={`Flagged Students (${flaggedStudents.length})`} loading={loading}>
          {flaggedStudents.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">
              {riskScores.length === 0 ? 'No risk analysis run yet.' : '🎉 No flagged students.'}
            </p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {flaggedStudents.slice(0, 8).map((r) => (
                <div key={r._id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{r.student?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{r.student?.studentId} · {r.student?.department}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${RISK_BADGE[r.riskCategory]}`}>
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

      {/* All Performances Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            All Student Performances ({performances.length})
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : performances.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">No performance data yet. Upload a CSV first.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                {['Student', 'Dept', 'Semester', 'GPA', 'Attendance', 'Behavior', 'Uploaded'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {performances.map((p) => (
                <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-700">{p.student?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{p.student?.studentId}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{p.student?.department ?? '—'}</td>
                  <td className="py-3 px-4 text-slate-500">{p.semester}</td>
                  <td className={`py-3 px-4 font-semibold ${
                    p.gpa < 4 ? 'text-red-600' : p.gpa < 6 ? 'text-orange-500' : 'text-slate-700'
                  }`}>
                    {p.gpa}
                  </td>
                  <td className={`py-3 px-4 font-semibold ${
                    p.attendancePercentage < 60 ? 'text-red-600' :
                    p.attendancePercentage < 75 ? 'text-orange-500' : 'text-slate-700'
                  }`}>
                    {p.attendancePercentage}%
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <div
                          key={dot}
                          className={`w-2 h-2 rounded-full ${dot <= (p.behaviorScore ?? 0) ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">{timeAgo(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}