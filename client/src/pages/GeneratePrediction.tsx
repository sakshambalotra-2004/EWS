import React, { useState } from 'react';
import Card from '../components/Card';
import PredictionLoader from '../components/PredictionLoader';

interface GeneratePredictionProps {
  onGenerate: () => void;
  riskGenerated: boolean;
}

const DATA_SOURCES = [
  { icon: '📊', label: 'GPA Data'   },
  { icon: '📋', label: 'Attendance' },
  { icon: '⭐', label: 'Behavior'   },
];

export default function GeneratePrediction({ onGenerate, riskGenerated }: GeneratePredictionProps) {
  const [loading, setLoading] = useState(false);

  const handleDone = () => {
    setLoading(false);
    onGenerate();
  };

  return (
    <div className="space-y-5">
      {loading && <PredictionLoader onDone={handleDone} />}

      <h1 className="text-2xl font-bold text-slate-800">Generate Risk Prediction</h1>

      <Card>
        <div className="text-center py-8 space-y-5">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center text-4xl">
            🤖
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">AI Risk Analysis Engine</h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">
              Uses machine learning to analyze GPA trends, attendance patterns, failed subjects,
              and behavioral data to identify at-risk students.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto text-sm">
            {DATA_SOURCES.map(({ icon, label }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-xl">{icon}</div>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
                <p className={`text-xs font-semibold mt-0.5 ${riskGenerated ? 'text-emerald-600' : 'text-slate-600'}`}>
                  {riskGenerated ? '✓ Ready' : 'Loaded'}
                </p>
              </div>
            ))}
          </div>

          {riskGenerated ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <p className="text-emerald-700 font-semibold">✅ Risk analysis completed successfully</p>
              <p className="text-emerald-600 text-sm mt-1">
                Results available in Risk Analysis and student dashboards.
              </p>
            </div>
          ) : (
            <button
              onClick={() => setLoading(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-10 py-3.5 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              🚀 Generate Risk Prediction
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
