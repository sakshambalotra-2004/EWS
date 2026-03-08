import React, { useRef, useState } from 'react';

const BASE_URL = 'http://localhost:5000/api';

interface UploadResult { updated: number; errors: string[]; }

export default function UploadGPA() {
  const [semester,     setSemester]     = useState('4');
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [file,         setFile]         = useState<File | null>(null);
  const [status,       setStatus]       = useState<'idle'|'uploading'|'success'|'error'>('idle');
  const [result,       setResult]       = useState<UploadResult | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading'); setError(null);

    const fd = new FormData();
    fd.append('gpa',          file);
    fd.append('semester',     semester);
    fd.append('academicYear', academicYear);

    try {
      const res  = await fetch(`${BASE_URL}/admin/upload-gpa`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setResult({ updated: data.updated ?? 0, errors: data.errors ?? [] });
      setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStatus('error');
    }
  };

  const reset = () => { setFile(null); setStatus('idle'); setResult(null); setError(null); };

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Upload GPA Data</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload the registrar's GPA file. This is admin-only — GPA is official academic record data.
        </p>
      </div>

      {/* Semester config */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-wrap gap-5 items-end">
        <div>
          <label htmlFor="sem" className="text-xs font-medium text-slate-500">Semester</label>
          <input id="sem" type="number" min={1} max={8} value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="block border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 w-24 focus:outline-none focus:ring-2 focus:ring-violet-400" />
        </div>
        <div>
          <label htmlFor="yr" className="text-xs font-medium text-slate-500">Academic Year</label>
          <input id="yr" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
            className="block border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 w-32 focus:outline-none focus:ring-2 focus:ring-violet-400" />
        </div>
        <p className="text-xs text-slate-400 pb-2">GPA will be matched to this semester + year.</p>
      </div>

      {/* Upload panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Upload gpa.csv</h2>

        {status === 'success' && result ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
            <p className="text-emerald-700 font-semibold">✅ GPA upload successful</p>
            <div className="bg-white rounded-lg p-4 text-center border border-emerald-100">
              <p className="text-3xl font-bold text-emerald-600">{result.updated}</p>
              <p className="text-xs text-slate-500 mt-1">Student records updated with GPA</p>
            </div>
            {result.errors.length > 0 && (
              <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg space-y-1">
                <p className="font-semibold">⚠️ {result.errors.length} student(s) skipped:</p>
                <div className="max-h-24 overflow-y-auto">
                  {result.errors.slice(0, 10).map((e, i) => <p key={i} className="text-amber-600">{e}</p>)}
                  {result.errors.length > 10 && <p className="text-amber-400">…and {result.errors.length - 10} more</p>}
                </div>
              </div>
            )}
            <button onClick={reset} className="text-xs text-violet-600 underline">Upload again</button>
          </div>
        ) : (
          <>
            {/* Drop zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
              onClick={() => ref.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                file ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'}`}
            >
              <input ref={ref} type="file" accept=".csv" aria-label="Upload GPA CSV" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
              {file ? (
                <div>
                  <p className="text-violet-600 font-semibold">📎 {file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB — ready to upload</p>
                </div>
              ) : (
                <div>
                  <p className="text-3xl mb-2">🎓</p>
                  <p className="text-sm font-medium text-slate-600">Drop gpa.csv here or click to browse</p>
                  <p className="text-xs text-slate-400 mt-1">Expected columns: studentId, previousGPA</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">⚠️ {error}</div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || status === 'uploading'}
              className="mt-5 w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white py-3 rounded-xl text-sm font-semibold transition"
            >
              {status === 'uploading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading GPA data...
                </span>
              ) : file ? '🚀 Upload GPA File' : 'Select a file to continue'}
            </button>
          </>
        )}
      </div>

      {/* What this does */}
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 text-sm text-violet-800">
        <p className="font-semibold mb-2">ℹ️ How GPA upload works</p>
        <ul className="text-xs text-violet-700 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>Each student is matched by <strong>studentId</strong> and the semester/year you selected above.</li>
          <li>If the student already has a performance record from faculty's marks upload, the GPA field is updated on that record.</li>
          <li>If no record exists yet, a skeleton record is created so GPA is ready when faculty upload arrives.</li>
          <li>GPA is on a <strong>0–10 scale</strong>. The risk model uses it directly.</li>
        </ul>
      </div>

      {/* Format guide */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">📋 Expected CSV Format</h2>
        <div className="font-mono text-xs max-w-xs">
          <p className="font-semibold text-slate-600 mb-1.5">gpa.csv</p>
          <div className="bg-slate-900 text-violet-300 p-3 rounded-xl space-y-1">
            <p>studentId,previousGPA</p>
            <p className="text-slate-500">1001,7.85</p>
            <p className="text-slate-500">1002,6.40</p>
            <p className="text-slate-500">1003,5.70</p>
          </div>
          <p className="text-slate-400 text-xs mt-1.5">GPA should be on a 0–10 scale. One row per student.</p>
        </div>
      </div>

    </div>
  );
}