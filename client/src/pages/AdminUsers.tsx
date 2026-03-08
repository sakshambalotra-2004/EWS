import React, { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────

type Role   = 'admin' | 'faculty' | 'counselor' | 'student';
type Status = 'Active' | 'Inactive';

interface User {
  _id:        string;
  name:       string;
  email:      string;
  role:       Role;
  department: string;
  studentId?: string;
  facultyId?: string;
  semester?:  number;
  batch?:     string;
  phone?:     string;
  isActive:   boolean;
}

interface NewUserForm {
  name:       string;
  email:      string;
  password:   string;
  role:       Role;
  department: string;
  studentId:  string;
  facultyId:  string;
  semester:   string;
  batch:      string;
  phone:      string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<Role, string> = {
  admin:     'bg-purple-100 text-purple-700',
  faculty:   'bg-blue-100 text-blue-700',
  counselor: 'bg-emerald-100 text-emerald-700',
  student:   'bg-amber-100 text-amber-700',
};

const EMPTY_FORM: NewUserForm = {
  name: '', email: '', password: '', role: 'student',
  department: '', studentId: '', facultyId: '',
  semester: '', batch: '', phone: '',
};

// ── Sub-components ─────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl">✕</button>
        <h2 className="text-lg font-bold text-slate-800 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function AdminUsers() {
  const [users,      setUsers]      = useState<User[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState<NewUserForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [search,     setSearch]     = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const getHeaders = (): HeadersInit => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${BASE_URL}/admin/users`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users as User[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ── Create ───────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    setFormError(null);
    if (!form.name || !form.email || !form.password || !form.role) {
      setFormError('Name, email, password and role are required.');
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name, email: form.email,
        password: form.password, role: form.role,
        department: form.department, phone: form.phone,
      };
      if (form.role === 'student') {
        body.studentId = form.studentId;
        body.semester  = form.semester ? parseInt(form.semester) : undefined;
        body.batch     = form.batch;
      }
      if (form.role === 'faculty') body.facultyId = form.facultyId;

      const res = await fetch(`${BASE_URL}/admin/users`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to create user');

      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchUsers();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle Active ────────────────────────────────────────────────────────

  const handleToggle = async (userId: string) => {
    setTogglingId(userId);
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${userId}/toggle`, {
        method: 'PUT', headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Toggle failed');
      setUsers((prev) =>
        prev.map((u) => u._id === userId ? { ...u, isActive: !u.isActive } : u)
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Toggle failed');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Filtered list ────────────────────────────────────────────────────────

  const filtered = users.filter((u) => {
    const matchRole   = filterRole === 'all' || u.role === filterRole;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage platform users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors"
        >
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          aria-label="Filter by role"
          title="Filter by role"
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="faculty">Faculty</option>
          <option value="counselor">Counselor</option>
          <option value="student">Student</option>
        </select>
        <button onClick={fetchUsers} className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
          ↻
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">⚠️ {error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-12">No users found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                {['Name', 'Email', 'Department', 'Role', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {u.name}
                    {u.studentId && <span className="ml-1 text-xs text-slate-400">({u.studentId})</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{u.email}</td>
                  <td className="py-3 px-4 text-slate-500">{u.department || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${ROLE_COLORS[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggle(u._id)}
                      disabled={togglingId === u._id}
                      className={`text-xs font-medium px-3 py-1 rounded-lg transition ${
                        u.isActive
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      } disabled:opacity-50`}
                    >
                      {togglingId === u._id ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary bar */}
      <p className="text-xs text-slate-400 text-right">
        Showing {filtered.length} of {users.length} users
      </p>

      {/* Add User Modal */}
      {showModal && (
        <Modal title="Add New User" onClose={() => { setShowModal(false); setForm(EMPTY_FORM); setFormError(null); }}>
          <div className="space-y-3">
            {formError && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 font-medium">Full Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Dr. Sharma"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="user@ews.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 font-medium">Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter password"
                  aria-label="Password"
                  title="Password"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  aria-label="Select user role"
                  title="Select user role"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="counselor">Counselor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 font-medium">Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="+91..."
                />
              </div>
            </div>

            {/* Student-specific fields */}
            {form.role === 'student' && (
              <div className="grid grid-cols-3 gap-3 p-3 bg-amber-50 rounded-xl">
                <div>
                  <label className="text-xs text-slate-500 font-medium">Student ID</label>
                  <input
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="STU001"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium">Semester</label>
                  <input
                    type="number" min={1} max={8}
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="4"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium">Batch</label>
                  <input
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="2022-26"
                  />
                </div>
              </div>
            )}

            {/* Faculty-specific fields */}
            {form.role === 'faculty' && (
              <div className="p-3 bg-blue-50 rounded-xl">
                <label className="text-xs text-slate-500 font-medium">Faculty ID</label>
                <input
                  value={form.facultyId}
                  onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="FAC001"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setFormError(null); }}
                className="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2 rounded-xl font-medium transition disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}