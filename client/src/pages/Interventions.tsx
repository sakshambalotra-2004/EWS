import React, { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────

type InterventionType   = 'meeting' | 'alert' | 'remedial_class' | 'counseling' | 'notification';
type InterventionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type RiskCategory       = 'critical' | 'high' | 'medium' | 'low';

interface Intervention {
  _id:         string;
  type:        InterventionType;
  status:      InterventionStatus;
  title:       string;
  description: string;
  scheduledAt?: string;
  createdAt:   string;
  emailSent:   boolean;
  smsSent:     boolean;
  student?: {
    _id:        string;
    name:       string;
    studentId:  string;
    department: string;
  };
  initiatedBy?: { name: string; role: string };
}

interface RiskScore {
  _id:          string;
  riskCategory: RiskCategory;
  riskScore:    number;
  student?: {
    _id:       string;
    name:      string;
    studentId: string;
  };
}

interface NewForm {
  studentId:   string;
  type:        InterventionType;
  title:       string;
  description: string;
  scheduledAt: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const INTERVENTION_TYPES: { value: InterventionType; label: string; icon: string }[] = [
  { value: 'meeting',        label: 'Meeting',        icon: '🤝' },
  { value: 'alert',          label: 'Alert',          icon: '🔔' },
  { value: 'remedial_class', label: 'Remedial Class', icon: '📚' },
  { value: 'counseling',     label: 'Counseling',     icon: '💬' },
  { value: 'notification',   label: 'Notification',   icon: '📣' },
];

const STATUS_STYLES: Record<InterventionStatus, string> = {
  pending:     'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-slate-100 text-slate-500',
};

const STATUS_OPTIONS: InterventionStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];

const TYPE_ICON: Record<InterventionType, string> = {
  meeting:       '🤝',
  alert:         '🔔',
  remedial_class:'📚',
  counseling:    '💬',
  notification:  '📣',
};

const EMPTY_FORM: NewForm = {
  studentId:   '',
  type:        'meeting',
  title:       '',
  description: '',
  scheduledAt: '',
};

const timeAgo = (dateStr: string) => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function Interventions() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [riskScores,    setRiskScores]    = useState<RiskScore[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [showForm,      setShowForm]      = useState(false);
  const [form,          setForm]          = useState<NewForm>(EMPTY_FORM);
  const [submitting,    setSubmitting]    = useState(false);
  const [formError,     setFormError]     = useState<string | null>(null);
  const [filterStatus,  setFilterStatus]  = useState<string>('all');
  const [filterType,    setFilterType]    = useState<string>('all');
  const [updatingId,    setUpdatingId]    = useState<string | null>(null);
  const [expandedId,    setExpandedId]    = useState<string | null>(null);

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
      const [ivRes, riskRes] = await Promise.all([
        fetch(`${BASE_URL}/interventions`,           { headers: getHeaders() }),
        fetch(`${BASE_URL}/counselor/risk-scores`,   { headers: getHeaders() }),
      ]);
      if (!ivRes.ok) throw new Error('Failed to fetch interventions');
      const ivJson   = await ivRes.json();
      const riskJson = riskRes.ok ? await riskRes.json() : { analyses: [] };
      setInterventions((ivJson.interventions  ?? []) as Intervention[]);
      setRiskScores((riskJson.analyses        ?? []) as RiskScore[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ── Create ────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    setFormError(null);
    if (!form.studentId || !form.title) {
      setFormError('Student and title are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res  = await fetch(`${BASE_URL}/interventions`, {
        method:  'POST',
        headers: getHeaders(),
        body:    JSON.stringify({
          studentId:    form.studentId,
          type:         form.type,
          title:        form.title,
          description:  form.description,
          scheduledAt:  form.scheduledAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create');
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchAll();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Update Status ─────────────────────────────────────────────────────────

  const handleStatusChange = async (id: string, status: InterventionStatus) => {
    setUpdatingId(id);
    try {
      await fetch(`${BASE_URL}/interventions/${id}`, {
        method:  'PUT',
        headers: getHeaders(),
        body:    JSON.stringify({ status }),
      });
      setInterventions((prev) =>
        prev.map((iv) => iv._id === id ? { ...iv, status } : iv)
      );
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Bulk Intervene ────────────────────────────────────────────────────────

  const handleBulkIntervene = async () => {
    if (!confirm('Auto-create alerts for all high/critical risk students?')) return;
    try {
      const res  = await fetch(`${BASE_URL}/counselor/bulk-intervene`, {
        method: 'POST', headers: getHeaders(),
      });
      const data = await res.json();
      alert(`✅ Created ${data.triggered} interventions.`);
      fetchAll();
    } catch {
      alert('Bulk intervene failed');
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = interventions.filter((iv) => {
    const matchStatus = filterStatus === 'all' || iv.status === filterStatus;
    const matchType   = filterType   === 'all' || iv.type   === filterType;
    return matchStatus && matchType;
  });

  const atRiskStudents = riskScores.filter((r) => ['critical', 'high', 'medium'].includes(r.riskCategory));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Interventions</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage student support actions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBulkIntervene}
            className="text-xs px-3 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-100 transition font-medium"
          >
            ⚡ Bulk Intervene
          </button>
          <button
            onClick={fetchAll}
            className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            ↻
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setFormError(null); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors"
          >
            + New Intervention
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">⚠️ {error}</div>}

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">New Intervention</h2>
          {formError && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg mb-3">{formError}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="student-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Student *
              </label>
              <select
                id="student-select"
                title="Select student"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full mt-1.5 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="">Select student…</option>
                {atRiskStudents.map((r) => (
                  <option key={r._id} value={r.student?._id ?? ''}>
                    {r.student?.name} ({r.student?.studentId}) — {r.riskCategory.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Type *
              </label>
              <select
                id="type-select"
                title="Intervention type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as InterventionType })}
                className="w-full mt-1.5 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                {INTERVENTION_TYPES.map(({ value, label, icon }) => (
                  <option key={value} value={value}>{icon} {label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title-input" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Title *
              </label>
              <input
                id="title-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Academic Review Meeting"
                className="w-full mt-1.5 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <div>
              <label htmlFor="schedule-input" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Scheduled At
              </label>
              <input
                id="schedule-input"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                className="w-full mt-1.5 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="desc-input" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Description
              </label>
              <textarea
                id="desc-input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe the intervention plan…"
                className="w-full mt-1.5 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create & Notify Student'}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(null); }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          title="Filter by status"
          aria-label="Filter by status"
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          title="Filter by type"
          aria-label="Filter by type"
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
        >
          <option value="all">All Types</option>
          {INTERVENTION_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <p className="text-xs text-slate-400 self-center ml-auto">
          {filtered.length} of {interventions.length} interventions
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-12">
            {interventions.length === 0 ? 'No interventions yet. Create one or run Bulk Intervene.' : 'No results match your filters.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                {['Student', 'Type', 'Title', 'Status', 'Notified', 'Date', 'Action'].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((iv) => (
                <React.Fragment key={iv._id}>
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-700">{iv.student?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{iv.student?.studentId}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {TYPE_ICON[iv.type]} {iv.type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate">{iv.title}</td>
                    <td className="py-3 px-3">
                      <select
                        value={iv.status}
                        onChange={(e) => handleStatusChange(iv._id, e.target.value as InterventionStatus)}
                        disabled={updatingId === iv._id}
                        aria-label={`Status for ${iv.title}`}
                        title="Update status"
                        className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-300 ${STATUS_STYLES[iv.status]} disabled:opacity-50`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-400">
                      {iv.emailSent && <span title="Email sent">📧</span>}
                      {iv.smsSent   && <span title="SMS sent" className="ml-1">📱</span>}
                      {!iv.emailSent && !iv.smsSent && '—'}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-400">{timeAgo(iv.createdAt)}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setExpandedId(expandedId === iv._id ? null : iv._id)}
                        className="text-emerald-600 hover:text-emerald-800 text-xs font-medium"
                      >
                        {expandedId === iv._id ? 'Close' : 'View'}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expandedId === iv._id && (
                    <tr className="bg-emerald-50 border-b border-slate-100">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Description</p>
                            <p className="text-slate-700">{iv.description || 'No description provided.'}</p>
                          </div>
                          <div className="space-y-1 text-xs text-slate-500">
                            {iv.scheduledAt && (
                              <p>📅 Scheduled: <span className="text-slate-700 font-medium">{new Date(iv.scheduledAt).toLocaleString()}</span></p>
                            )}
                            {iv.initiatedBy && (
                              <p>👤 By: <span className="text-slate-700 font-medium">{iv.initiatedBy.name} ({iv.initiatedBy.role})</span></p>
                            )}
                            <p>📧 Email sent: <span className="text-slate-700 font-medium">{iv.emailSent ? 'Yes' : 'No'}</span></p>
                            <p>📱 SMS sent: <span className="text-slate-700 font-medium">{iv.smsSent ? 'Yes' : 'No'}</span></p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}