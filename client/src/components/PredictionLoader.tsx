import React, { useState, useEffect } from 'react';

interface PredictionLoaderProps {
  onDone: () => void;
}

const STEPS = [
  'Analyzing academic data…',
  'Running AI risk model…',
  'Identifying at-risk students…',
  'Finalizing risk scores…',
];

export default function PredictionLoader({ onDone }: PredictionLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 1.2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onDone, 400);
          return 100;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onDone]);

  const stepIndex = Math.min(
    Math.floor((progress / 100) * STEPS.length),
    STEPS.length - 1
  );

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-10 w-96 shadow-2xl text-center space-y-6">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"
            style={{ animationDuration: '0.9s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
        </div>

        {/* Label */}
        <div>
          <h3 className="text-slate-800 font-bold text-lg">AI Risk Analysis</h3>
          <p className="text-emerald-600 text-sm mt-1 font-medium min-h-[1.2em] transition-all">
            {STEPS[stepIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{Math.round(progress)}% complete</p>
        </div>
      </div>
    </div>
  );
}
