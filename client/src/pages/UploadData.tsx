import React, { useState } from 'react';
import Card from '../components/Card';

const UPLOAD_TYPES = [
  { icon: '📋', title: 'Attendance Data',       desc: 'Upload weekly attendance records'       },
  { icon: '📊', title: 'GPA / Academic Data',   desc: 'Upload grades and academic performance' },
];

export default function UploadData() {
  const [uploaded, setUploaded] = useState<Record<number, boolean>>({});

  const toggle = (idx: number) =>
    setUploaded((u) => ({ ...u, [idx]: !u[idx] }));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Upload Data</h1>

      <div className="grid grid-cols-2 gap-5">
        {UPLOAD_TYPES.map(({ icon, title, desc }, idx) => (
          <Card key={idx}>
            <div className="text-center space-y-3">
              <div className="text-4xl">{icon}</div>
              <div>
                <h3 className="font-semibold text-slate-700">{title}</h3>
                <p className="text-sm text-slate-400 mt-1">{desc}</p>
              </div>
              <div
                onClick={() => toggle(idx)}
                className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
                  uploaded[idx]
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                {uploaded[idx]
                  ? <p className="text-emerald-600 font-semibold text-sm">✅ File uploaded successfully</p>
                  : <p className="text-slate-400 text-sm">Click to upload CSV</p>
                }
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
