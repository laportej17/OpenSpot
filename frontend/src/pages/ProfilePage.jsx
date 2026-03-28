import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe, updateMe } from '../api/client';

export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    async function load() {
      try {
        const me = await getMe();
        setForm({ name: me.name, email: me.email });
      } catch {
        // Token likely expired — log out
        logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    setErrMsg('');
    setSaving(true);
    try {
      const updated = await updateMe({
        name: form.name,
        email: form.email,
      });
      // Refresh the stored user in context / localStorage
      const token = localStorage.getItem('openspot_token');
      login({ id: user.id, name: updated.name, email: updated.email }, token);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrMsg(err.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-3)' }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Your profile</h1>
        <p>Update your name or email address</p>
      </div>

      {/* Avatar circle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--accent, #e07b4f)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '-0.02em',
        }}>
          {form.name ? form.name[0].toUpperCase() : '?'}
        </div>
      </div>

      <div className="panel">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            Full name
            <input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Jane Smith"
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@email.com"
            />
          </label>

          {status === 'success' && (
            <p className="success">✓ Profile updated successfully.</p>
          )}
          {status === 'error' && (
            <p className="error">{errMsg}</p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>

      <div
        className="panel"
        style={{
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <p style={{ fontWeight: 600, marginBottom: '0.15rem' }}>Sign out</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>
            You'll need to log back in to manage listings or bookings.
          </p>
        </div>
        <button
          className="btn-ghost"
          style={{ flexShrink: 0 }}
          onClick={() => { logout(); navigate('/'); }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}