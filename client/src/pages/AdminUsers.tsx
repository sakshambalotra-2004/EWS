import React from 'react';
import Card from '../components/Card';

const ROLE_COLORS: Record<string, string> = {
  faculty:   'bg-blue-100 text-blue-700',
  counselor: 'bg-emerald-100 text-emerald-700',
  student:   'bg-amber-100 text-amber-700',
};

const USERS = [
  { name: 'Dr. Roberts',  dept: 'CS',  role: 'faculty',   status: 'Active'   },
  { name: 'Sarah Chen',   dept: 'ALL', role: 'counselor', status: 'Active'   },
  { name: 'Prof. Adams',  dept: 'EE',  role: 'faculty',   status: 'Active'   },
  { name: 'Lin Wei',      dept: 'BBA', role: 'student',   status: 'Active'   },
  { name: 'John Doe',     dept: 'ME',  role: 'faculty',   status: 'Inactive' },
];

export default function AdminUsers() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage platform users</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
          + Add User
        </button>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {['Name', 'Department', 'Role', 'Status', 'Action'].map((h) => (
                <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USERS.map((u, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3 font-medium text-slate-700">{u.name}</td>
                <td className="py-3 px-3 text-slate-500">{u.dept}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${ROLE_COLORS[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <button className="text-emerald-600 hover:text-emerald-800 text-xs font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
