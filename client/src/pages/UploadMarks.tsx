import React, { useState } from 'react';
import Card from '../components/Card';

const META = [
  { label: 'Course',  value: 'CS301 — Data Structures' },
  { label: 'Semester', value: 'Spring 2025'              },
  { label: 'Records',  value: '48 students'              },
];

export default function UploadMarks() {
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Upload Marks</h1>

      <Card title="Upload CSV File">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); setUploaded(true); }}
          onClick={() => setUploaded(true)}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            dragging  ? 'border-emerald-500 bg-emerald-50' :
            uploaded  ? 'border-emerald-400 bg-emerald-50' :
            'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
          }`}
        >
          {uploaded ? (
            <div className="space-y-2">
              <div className="text-4xl">✅</div>
              <p className="font-semibold text-emerald-600">marks_cs301_midterm.csv uploaded!</p>
              <p className="text-sm text-slate-400">48 student records detected</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">📂</div>
              <p className="font-semibold text-slate-600">Drop your CSV file here</p>
              <p className="text-sm text-slate-400">or click to browse</p>
              <p className="text-xs text-slate-300 mt-3">Supported: .csv — Max 10 MB</p>
            </div>
          )}
        </div>

        {uploaded && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              {META.map(({ label, value }) => (
                <div key={label} className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-slate-400 text-xs">{label}</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition-colors">
              Submit Marks
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
