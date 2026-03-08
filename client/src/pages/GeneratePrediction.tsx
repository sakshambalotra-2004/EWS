import React, { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────

type RiskCategory = 'critical' | 'high' | 'medium' | 'low';

interface AnalysisResult {
  student:  string;
  riskScore?: number;
  category?: RiskCategory;
  error?:   string;
}

interface SummaryStats {
  processed: number;
  critical:  number;
  high:      number;
  medium:    number;
  low:       number;
  failed:    number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const DATA_SOURCES = [
  { icon: '📊', label: 'GPA Data'   },
  { icon: '📋', label: 'Attendance' },
  { icon: '⭐', label: 'Behavior'   },
];

const STEPS = [
  'Loading student performance data...',
  'Building feature vectors...',
  'Running logistic regression model...',
  'Calculating risk scores (0–1)...',
  'Categorizing risk levels...',
  'Generating explanations & suggestions...',
  'Saving results to database...',
];

const RISK_BADGE: Record<RiskCategory, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-amber-100 text-amber-700',
  low:      'bg-emerald-100 text-emerald-700',
};

// ── Sub-components ─────────────────────────────────────────────────────────

function StepLoader({ step, total }: { step: number; total: number }) {
  return (
    <div className="space-y-3">
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-700"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>
      <p className="text-sm text-slate-600 text-center animate-pulse">{STEPS[step]}</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function GeneratePrediction() {
  const [status,     setStatus]     = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [step,       setStep]       = useState(0);
  const [results,    setResults]    = useState<AnalysisResult[]>([]);
  const [summary,    setSummary]    = useState<SummaryStats | null>(null);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);
  const [semester,   setSemester]   = useState('4');
  const [acadYear,   setAcadYear]   = useState('2024-25');
  const [perfCount,  setPerfCount]  = useState<number | null>(null);

  const getHeaders = (): HeadersInit => ({
    Authorization:  `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  // ── FIX: Changed from /faculty/students → /counselor/students ─────────────
  useEffect(() => {
    const checkPerfs = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/counselor/students?semester=${semester}&academicYear=${acadYear}`,
          { headers: getHeaders() }
        );

        // FIX: If endpoint returns non-OK, don't block the button
        if (!res.ok) {
          setPerfCount(null);
          return;
        }

        const data = await res.json();
        // FIX: Handle multiple response shapes
        setPerfCount(data.count ?? data.students?.length ?? 0);
      } catch {
        // FIX: On any network error, set null (unknown) — don't block the button
        setPerfCount(null);
      }
    };
    checkPerfs();
  }, [semester, acadYear]);

  // ── Run Analysis ──────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setStatus('loading');
    setStep(0);
    setResults([]);
    setSummary(null);
    setErrorMsg(null);

    // Animate through steps while API runs
    let currentStep = 0;
    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < STEPS.length - 1) {
        setStep(currentStep);
      } else {
        clearInterval(stepInterval);
      }
    }, 600);

    try {
      const res = await fetch(`${BASE_URL}/counselor/analyze-all`, {
        method:  'POST',
        headers: getHeaders(),
        body:    JSON.stringify({ semester: parseInt(semester), academicYear: acadYear }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Analysis failed');
      }

      const data = await res.json();
      setStep(STEPS.length - 1);

      // Small delay so last step shows
      await new Promise((r) => setTimeout(r, 500));

      const analysisResults = (data.results ?? []) as AnalysisResult[];
      setResults(analysisResults);

      // Compute summary
      const stats: SummaryStats = { processed: data.processed ?? 0, critical: 0, high: 0, medium: 0, low: 0, failed: 0 };
      analysisResults.forEach((r) => {
        if (r.error)                        stats.failed++;
        else if (r.category === 'critical') stats.critical++;
        else if (r.category === 'high')     stats.high++;
        else if (r.category === 'medium')   stats.medium++;
        else                                stats.low++;
      });
      setSummary(stats);
      setStatus('done');

    } catch (err: unknown) {
      clearInterval(stepInterval);
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setStep(0);
    setResults([]);
    setSummary(null);
    setErrorMsg(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 p-6 bg-slate-50 min-h-screen">

      <h1 className="text-2xl font-bold text-slate-800">Generate Risk Prediction</h1>

      {/* Config */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">Analysis Configuration</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label htmlFor="semester-input" className="text-xs font-medium text-slate-500">Semester</label>
            <input
              id="semester-input"
              type="number" min={1} max={8}
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              disabled={status === 'loading'}
              className="block border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 w-24 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="year-input" className="text-xs font-medium text-slate-500">Academic Year</label>
            <input
              id="year-input"
              value={acadYear}
              onChange={(e) => setAcadYear(e.target.value)}
              disabled={status === 'loading'}
              className="block border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 w-32 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
            />
          </div>
          <p className="text-xs text-slate-400 pb-2">
            {perfCount !== null
              ? `${perfCount} student record${perfCount !== 1 ? 's' : ''} ready`
              : 'Checking...'}
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="text-center space-y-5">

          {/* Icon */}
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center text-4xl">
            {status === 'done' ? '✅' : status === 'error' ? '❌' : '🤖'}
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-slate-800">AI Risk Analysis Engine</h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">
              Uses logistic regression (perceptron logic) to analyze GPA, attendance patterns,
              and behavioral data to identify at-risk students with explainable risk scores.
            </p>
          </div>

          {/* Data source pills */}
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto text-sm">
            {DATA_SOURCES.map(({ icon, label }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-xl">{icon}</div>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
                <p className={`text-xs font-semibold mt-0.5 ${status === 'done' ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {status === 'done' ? '✓ Used' : 'Ready'}
                </p>
              </div>
            ))}
          </div>

          {/* Loading steps */}
          {status === 'loading' && (
            <div className="max-w-md mx-auto py-4">
              <StepLoader step={step} total={STEPS.length} />
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 max-w-md mx-auto">
              <p className="text-red-700 font-semibold text-sm">❌ Analysis failed</p>
              <p className="text-red-600 text-xs mt-1">{errorMsg}</p>
              <button onClick={handleReset} className="mt-3 text-xs text-red-600 underline">Try again</button>
            </div>
          )}

          {/* Success summary */}
          {status === 'done' && summary && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3">
              <p className="text-emerald-700 font-bold text-center">✅ Risk analysis completed</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {(['critical', 'high', 'medium', 'low'] as RiskCategory[]).map((cat) => (
                  <div key={cat} className={`rounded-xl p-2 ${RISK_BADGE[cat]}`}>
                    <p className="text-lg font-bold">{summary[cat]}</p>
                    <p className="text-xs capitalize">{cat}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-emerald-600">
                {summary.processed} students processed · {summary.failed > 0 ? `${summary.failed} failed` : 'All successful'}
              </p>
              <button onClick={handleReset} className="w-full text-xs text-emerald-700 border border-emerald-200 py-2 rounded-xl hover:bg-emerald-100 transition">
                Run Again
              </button>
            </div>
          )}

          {/* CTA button — FIX: only disable when count is KNOWN to be 0, not null */}
          {status === 'idle' && (
            <button
              onClick={handleGenerate}
              disabled={perfCount !== null && perfCount === 0}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-10 py-3.5 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              🚀 Generate Risk Prediction
            </button>
          )}
          {perfCount !== null && perfCount === 0 && status === 'idle' && (
            <p className="text-xs text-slate-400">Upload student CSV data first before running analysis.</p>
          )}

        </div>
      </div>

      {/* Results table */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
              Analysis Results ({results.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                {['Student ID', 'Risk Score', 'Category', 'Status'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{r.student}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {r.riskScore != null ? `${(r.riskScore * 100).toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {r.category ? (
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${RISK_BADGE[r.category]}`}>
                        {r.category.toUpperCase()}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {r.error ? (
                      <span className="text-xs text-red-500">❌ {r.error}</span>
                    ) : (
                      <span className="text-xs text-emerald-600">✓ Success</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}