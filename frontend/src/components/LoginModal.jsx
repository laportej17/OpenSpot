import { useNavigate } from 'react-router-dom';

export default function LoginModal({ onClose }) {
  const navigate = useNavigate();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Sign in to continue</h2>
        <p style={{ marginBottom: '1.75rem' }}>
          You need an account to do that. It only takes a moment.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button onClick={() => { onClose(); navigate('/login'); }}>
            Log in
          </button>
          <button className="btn-ghost" onClick={() => { onClose(); navigate('/signup'); }}>
            Create an account
          </button>
        </div>
        <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-3)', cursor: 'pointer' }}
          onClick={onClose}>
          Cancel
        </p>
      </div>
    </div>
  );
}