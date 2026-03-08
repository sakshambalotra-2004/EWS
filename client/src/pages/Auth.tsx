import { useState, FormEvent } from 'react';

const BASE_URL = 'http://localhost:5000/api';

type Role = 'admin' | 'faculty' | 'counselor' | 'student';

export default function Auth() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res  = await fetch(`${BASE_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Save token AND full user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('role',  data.user.role   as Role);
      localStorage.setItem('name',  data.user.name);
      localStorage.setItem('userId', data.user.id);

      window.location.reload();

    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100">
      <div className="bg-white w-[400px] p-8 rounded-2xl shadow-xl border border-slate-100">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-md">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-slate-800">SMART-EWS</h2>
          <p className="text-sm text-slate-400 text-center mt-1">
            Smart Early Warning System for Students
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="you@ews.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-60 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Role hint */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-500 mb-2">Demo accounts:</p>
          <p>🛡️ <span className="font-medium">Admin</span> — admin@ews.com / admin123</p>
          <p>👨‍🏫 <span className="font-medium">Faculty</span> — faculty@ews.com / faculty123</p>
          <p>🧑‍⚕️ <span className="font-medium">Counselor</span> — counselor@ews.com / counselor123</p>
          <p>🎓 <span className="font-medium">Student</span> — stu001@ews.com / stu123</p>
        </div>

        <p className="text-xs text-center text-slate-400 mt-4">
          New accounts are created by an admin.
        </p>

      </div>
    </div>
  );
}