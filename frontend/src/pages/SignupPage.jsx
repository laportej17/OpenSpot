import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Signup failed');
        return;
      }
      const loginRes = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();
      login(loginData.user, loginData.access_token);
      navigate('/');
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <h2>Create account</h2>
        <p className="subtitle">Join OpenSpot and start renting spaces</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input type="text" required placeholder="Jane Smith"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Email
            <input type="email" required placeholder="you@email.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Password
            <input type="password" required placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading} style={{ marginTop: '0.25rem' }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}