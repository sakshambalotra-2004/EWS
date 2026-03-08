import React, { useRef, useState } from 'react';

const BASE_URL = 'http://localhost:5000/api';

interface UploadResult { inserted: number; updated: number; errors: string[]; }
interface FileState { file: File | null; status: 'idle'|'uploading'|'success'|'error'; result: UploadResult|null; error: string|null; }
const INIT: FileState = { file: null, status: 'idle', result: null, error: null };

function DropZone({ label, hint, state, onFile }: {
  label: string; hint: string; state: FileState; onFile: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      onClick={() => ref.current?.click()}
      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
        state.file ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
      <input ref={ref} type="file" accept=".csv" aria-label={`Upload ${label}`} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {state.file ? (
        <div>
          <p className="text-blue-600 font-semibold text-sm">📎 {state.file.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{(state.file.size/1024).toFixed(1)} KB</p>
        </div>
      ) : (
        <div>
          <p className="text-2xl mb-1">📂</p>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-xs text-slate-400 mt-1">{hint}</p>
        </div>
      )}
    </div>
  );
}

function ResultPanel({ result, onReset }: { result: UploadResult; onReset: () => void }) {
  return (
    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
      <p className="text-emerald-700 font-semibold">✅ Upload successful</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 text-center border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-600">{result.inserted}</p>
          <p className="text-xs text-slate-500 mt-0.5">New records</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-emerald-100">
          <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
          <p className="text-xs text-slate-500 mt-0.5">Updated</p>
        </div>
      </div>
      {result.errors.length > 0 && (
        <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg">
          ⚠️ {result.errors.length} student ID(s) not found in system — ask admin to register them first.
        </div>
      )}
      <button onClick={onReset} className="text-xs text-blue-600 underline">Upload again</button>
    </div>
  );
}

export default function UploadData() {
  const [semester,     setSemester]     = useState('4');
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [marksState,   setMarksState]   = useState<FileState>({...INIT});
  const [attState,     setAttState]     = useState<FileState>({...INIT});
  const [uploadStatus, setUploadStatus] = useState<'idle'|'uploading'|'success'|'error'>('idle');
  const [uploadResult, setUploadResult] = useState<UploadResult|null>(null);
  const [uploadError,  setUploadError]  = useState<string|null>(null);

  const bothReady = !!marksState.file && !!attState.file;

  const handleUpload = async () => {
    if (!bothReady) return;
    setUploadStatus('uploading'); setUploadError(null);

    const fd = new FormData();
    fd.append('marks',      marksState.file!);
    fd.append('attendance', attState.file!);
    fd.append('semester',     semester);
    fd.append('academicYear', academicYear);

    try {
      const res  = await fetch(`${BASE_URL}/faculty/upload-multi-csv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setUploadResult({ inserted: data.inserted ?? 0, updated: data.updated ?? 0, errors: data.errors ?? [] });
      setUploadStatus('success');
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setUploadStatus('error');
    }
  };

  const reset = () => {
    setMarksState({...INIT}); setAttState({...INIT});
    setUploadStatus('idle'); setUploadResult(null); setUploadError(null);
  };

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Upload Student Data</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload marks and attendance CSVs. GPA is handled separately by the Admin.
        </p>
      </div>

      {/* Semester config */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-wrap gap-5 items-end">
        <div>
          <label htmlFor="sem" className="text-xs font-medium text-slate-500">Semester</label>
          <input id="sem" type="number" min={1} max={8} value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="block border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 w-24 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label htmlFor="yr" className="text-xs font-medium text-slate-500">Academic Year</label>
          <input id="yr" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
            className="block border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <p className="text-xs text-slate-400 pb-2">Records will be tagged with this semester + year.</p>
      </div>

      {/* Upload panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">Upload Files</h2>
        <p className="text-xs text-slate-400 mb-4">
          Both files are required. Drop them in any order — they'll be merged automatically.
        </p>

        {uploadStatus === 'success' && uploadResult ? (
          <ResultPanel result={uploadResult} onReset={reset} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  📊 Marks + Behaviour
                </p>
                <DropZone
                  label="marks.csv"
                  hint="studentId, subject, internalMarks, assignmentSubmitted, behaviourScore"
                  state={marksState}
                  onFile={(f) => setMarksState({...INIT, file: f})}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  📋 Attendance
                </p>
                <DropZone
                  label="attendance.csv"
                  hint="studentId, subject, totalClasses, attendedClasses"
                  state={attState}
                  onFile={(f) => setAttState({...INIT, file: f})}
                />
              </div>
            </div>

            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">⚠️ {uploadError}</div>
            )}

            <button
              onClick={handleUpload}
              disabled={!bothReady || uploadStatus === 'uploading'}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-3 rounded-xl text-sm font-semibold transition"
            >
              {uploadStatus === 'uploading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Merging & uploading...
                </span>
              ) : bothReady ? '🚀 Upload Both Files' : 'Add both files above to continue'}
            </button>
          </>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800">
        <p className="font-semibold mb-2">ℹ️ What happens to GPA?</p>
        <p className="text-xs text-blue-700 leading-relaxed">
          Previous GPA is uploaded separately by the <strong>Admin</strong> from the registrar's records.
          Once both your upload and the admin's GPA upload are complete, risk scores can be generated by the Counselor.
        </p>
      </div>

      {/* Format reference */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">📋 Expected Column Format</h2>
        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <p className="font-semibold text-slate-600 mb-1.5">marks.csv</p>
            <div className="bg-slate-900 text-blue-300 p-3 rounded-xl space-y-1">
              <p>studentId,subject,</p>
              <p>internalMarks,</p>
              <p>assignmentSubmitted,</p>
              <p>behaviourScore</p>
              <p className="text-slate-500 pt-1">1001,OS,24,True,7</p>
            </div>
            <p className="text-slate-400 text-xs mt-1.5">Marks out of 30. Behaviour 1–10 (auto-scaled to 1–5).</p>
          </div>
          <div>
            <p className="font-semibold text-slate-600 mb-1.5">attendance.csv</p>
            <div className="bg-slate-900 text-blue-300 p-3 rounded-xl space-y-1">
              <p>studentId,subject,</p>
              <p>totalClasses,</p>
              <p>attendedClasses</p>
              <p className="text-slate-500 pt-1">1001,OS,43,38</p>
            </div>
            <p className="text-slate-400 text-xs mt-1.5">Attendance % is calculated automatically per subject then averaged.</p>
          </div>
        </div>
      </div>

    </div>
  );
}