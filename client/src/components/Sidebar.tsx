import React from 'react';
import type { Role } from '../types';

interface SidebarProps {
  role: Role;
  page: string;
  setPage: (page: string) => void;
}

const NAV: Record<Role, [string, string][]> = {
  admin: [
    ['📊', 'Dashboard'],
    ['👥', 'Users'],
    ['📈', 'Analytics']
  ],
  faculty: [
    ['📊', 'Dashboard'],
    ['📤', 'Upload Marks'],
    ['⭐', 'Behavior Rating']
  ],
  counselor: [
    ['📊', 'Dashboard'],
    ['📤', 'Upload Data'],
    ['🤖', 'Generate Prediction'],
    ['🎯', 'Risk Analysis'],
    ['💬', 'Interventions']
  ],
  student: [
    ['📊', 'Dashboard'],
    ['📈', 'My Progress'],
    ['🆘', 'Get Help']
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  faculty: 'Faculty',
  counselor: 'Counselor',
  student: 'Student',
};

const ROLE_BADGE_COLORS: Record<Role, string> = {
  admin: 'bg-violet-100 text-violet-700',
  faculty: 'bg-blue-100 text-blue-700',
  counselor: 'bg-emerald-100 text-emerald-700',
  student: 'bg-amber-100 text-amber-700',
};

const USER_INITIALS: Record<Role, string> = {
  admin: 'AD',
  faculty: 'DR',
  counselor: 'SC',
  student: 'ST',
};

const USER_NAMES: Record<Role, string> = {
  admin: 'Admin',
  faculty: 'Dr. Roberts',
  counselor: 'Sarah Chen',
  student: 'Student',
};

export default function Sidebar({ role, page, setPage }: SidebarProps) {

  const nav = NAV[role];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.reload();
  };

  return (

    <div className="w-60 min-h-screen bg-slate-900 flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
            S
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SMART-EWS</p>
            <p className="text-slate-500 text-xs">Early Warning System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">

        {nav.map(([icon, label]) => (
          <button
            key={label}
            onClick={() => setPage(label)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              page === label
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="text-base">{icon}</span>
            {label}
          </button>
        ))}

      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-slate-800">

        <div className="flex items-center gap-3 mb-3">

          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold">
            {USER_INITIALS[role]}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {USER_NAMES[role]}
            </p>

            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${ROLE_BADGE_COLORS[role]}`}>
              {ROLE_LABELS[role]}
            </span>
          </div>

        </div>

        <button
          onClick={logout}
          className="w-full text-xs py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
        >
          Logout
        </button>

      </div>

    </div>
  );
}