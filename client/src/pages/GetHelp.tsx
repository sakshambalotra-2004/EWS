import React, { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface Intervention {
  _id:         string;
  type:        string;
  title:       string;
  description: string;
  status:      string;
  createdAt:   string;
  initiatedBy?: { name: string; role: string };
}

// ── Helpers ────────────────────────────────────────────────────────────────

const timeAgo = (dateStr: string): string => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days} day${days  > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (mins  > 0) return `${mins} min${mins   > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const STATUS_STYLE: Record<string, string> = {
  pending:     'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-slate-100 text-slate-500',
};

const TYPE_ICON: Record<string, string> = {
  meeting:       '🤝',
  alert:         '🔔',
  remedial_class:'📚',
  counseling:    '💬',
  notification:  '📣',
};

const RESOURCES = [
  { icon: '🧑‍💼', title: 'Academic Counselor', desc: 'Send a message to your assigned counselor',    btn: 'Message' },
  { icon: '📚',   title: 'Tutoring Center',     desc: 'Get subject-specific academic support',        btn: 'Register' },
  { icon: '🆘',   title: 'Emergency Help',      desc: 'Immediate academic distress support line',     btn: 'Call Now' },
];

// ── Main Component ─────────────────────────────────────────────────────────

export default function GetHelp() {
  const [message,       setMessage]       = useState('');
  const [sending,       setSending]       = useState(false);
  const [sent,          setSent]          = useState(false);
  const [sendError,     setSendError]     = useState<string | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loadingHistory,setLoadingHistory]= useState(true);

  useEffect(() => { fetchInterventions(); }, []);

  const getHeaders = (): HeadersInit => ({
    Authorization:  `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  // ── Fetch my interventions ────────────────────────────────────────────────

  const fetchInterventions = async () => {
    setLoadingHistory(true);
    try {
      const res  = await fetch(`${BASE_URL}/student/my-interventions`, { headers: getHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInterventions((data.interventions ?? []) as Intervention[]);
    } catch {
      // silently fail — history is optional
    } finally {
      setLoadingHistory(false);
    }
  };

  // ── Send help request ─────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      const res  = await fetch(`${BASE_URL}/student/request-help`, {
        method:  'POST',
        headers: getHeaders(),
        body:    JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send');
      setSent(true);
      setMessage('');
      fetchInterventions(); // refresh history
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 p-6 bg-slate-50 min-h-screen">

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Get Help</h1>
        <p className="text-slate-500 text-sm mt-0.5">Reach out to your support network</p>
      </div>

      {/* Resource cards */}
      <div className="grid grid-cols-3 gap-4">
        {RESOURCES.map(({ icon, title, desc, btn }) => (
          <div key={title} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="text-center space-y-3 py-2">
              <div className="text-4xl">{icon}</div>
              <div>
                <h3 className="font-semibold text-slate-700">{title}</h3>
                <p className="text-xs text-slate-400 mt-1">{desc}</p>
              </div>
              <button
                onClick={() => btn === 'Message' && document.getElementById('message-box')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-medium transition-colors"
              >
                {btn}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Message box */}
      <div id="message-box" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
          Send a Message to Your Counselor
        </h2>

        {sent ? (
          <div className="text-center py-8 space-y-3">
            <div className="text-5xl">✅</div>
            <p className="font-semibold text-emerald-600 text-lg">Help request sent!</p>
            <p className="text-sm text-slate-400">Your counselor will respond within 24 hours.</p>
            <button
              onClick={() => setSent(false)}
              className="mt-2 text-sm text-emerald-600 underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sendError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">⚠️ {sendError}</div>
            )}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe your concern or what kind of help you need…"
              aria-label="Message to counselor"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">{message.length} characters</p>
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Intervention history */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
          My Support History
        </h2>

        {loadingHistory ? (
          <div className="flex items-center justify-center h-20">
            <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : interventions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">
            No support history yet. Send a message above to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {interventions.map((iv) => (
              <div key={iv._id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <span className="text-2xl">{TYPE_ICON[iv.type] ?? '📋'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-700 truncate">{iv.title}</p>
                    <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_STYLE[iv.status] ?? 'bg-slate-100 text-slate-500'}`}>
                      {iv.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{iv.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-slate-400">{timeAgo(iv.createdAt)}</p>
                    {iv.initiatedBy && (
                      <p className="text-xs text-slate-400">· By {iv.initiatedBy.name}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}