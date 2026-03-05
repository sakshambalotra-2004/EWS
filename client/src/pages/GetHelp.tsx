import React, { useState } from 'react';
import Card from '../components/Card';

const RESOURCES = [
  { icon: '🧑‍💼', title: 'Academic Counselor', desc: 'Book a session with Sarah Chen',   btn: 'Schedule'  },
  { icon: '📚',  title: 'Tutoring Center',     desc: 'Get subject-specific help',         btn: 'Register'  },
  { icon: '🆘',  title: 'Helpline',            desc: 'Immediate academic support',        btn: 'Call Now'  },
];

export default function GetHelp() {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Get Help</h1>

      <div className="grid grid-cols-3 gap-4">
        {RESOURCES.map(({ icon, title, desc, btn }) => (
          <Card key={title}>
            <div className="text-center space-y-3 py-2">
              <div className="text-4xl">{icon}</div>
              <div>
                <h3 className="font-semibold text-slate-700">{title}</h3>
                <p className="text-xs text-slate-400 mt-1">{desc}</p>
              </div>
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-medium transition-colors">
                {btn}
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Send a Message to Your Counselor">
        {sent ? (
          <div className="text-center py-6 space-y-2">
            <div className="text-4xl">✅</div>
            <p className="font-semibold text-emerald-600">Message sent successfully!</p>
            <p className="text-sm text-slate-400">Sarah Chen will respond within 24 hours.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe your concern or what kind of help you need…"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
            />
            <button
              onClick={() => setSent(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              Send Message
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
