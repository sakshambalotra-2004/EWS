import { useState, FormEvent } from 'react';

const BASE_URL = 'http://localhost:5000/api';

/**
 * This replaces the broken Register page.
 * Your backend has no /auth/register route — users are created by admin only.
 *
 * This page serves two purposes:
 *  1. First-time login: prompts user to set a new password
 *  2. Settings > Change Password for any logged-in user
 *
 * Usage in your router:
 *   <Route path="/change-password" element={<ChangePassword />} />
 */

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [success,         setSuccess]         = useState(false);

  const name = localStorage.getItem('name') ?? 'there';
  const role = localStorage.getItem('role') ?? '';

  const validate = (): string | null => {
    if (!currentPassword)            return 'Current password is required.';
    if (newPassword.length < 6)      return 'New password must be at least 6 characters.';
    if (newPassword === currentPassword) return 'New password must be different from current password.';
    if (newPassword !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError(null);
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/auth/change-password`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100">
        <div className="bg-white w-[400px] p-8 rounded-2xl shadow-xl border border-slate-100 text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold text-slate-800">Password Updated</h2>
          <p className="text-sm text-slate-400">Your password has been changed successfully.</p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium text-sm transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100">
      <div className="bg-white w-[420px] p-8 rounded-2xl shadow-xl border border-slate-100">

        {/* Header */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-md">
            🔐
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Change Password</h2>
          <p className="text-sm text-slate-400 text-center mt-1">
            Hi <span className="font-semibold text-slate-600">{name}</span>
            {role && <span> · <span className="capitalize">{role}</span></span>}
          </p>
        </div>

        {/* Info banner for first-time users */}
        <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-100 text-amber-700 text-xs rounded-xl">
          💡 If this is your first login, please update the default password assigned by your admin.
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="text-sm font-medium text-slate-600">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              placeholder="Your current password"
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          <div>
            <label htmlFor="new-password" className="text-sm font-medium text-slate-600">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              placeholder="At least 6 characters"
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="text-sm font-medium text-slate-600">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              placeholder="Repeat new password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full border rounded-xl p-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                confirmPassword && confirmPassword !== newPassword
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-200'
              }`}
              required
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-60 mt-2"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 mt-5">
          Don't know your current password?{' '}
          <span className="text-emerald-600 font-medium">Contact your admin.</span>
        </p>

      </div>
    </div>
  );
}