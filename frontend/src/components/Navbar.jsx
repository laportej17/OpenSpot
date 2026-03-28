import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="brand">OpenSpot</NavLink>
      <div className="nav-links">
        <NavLink to="/listings">Browse</NavLink>
        <NavLink to="/host/create">List a Space</NavLink>
        {user ? (
          <>
            <NavLink to="/my-listings">My Listings</NavLink>
            <NavLink to="/my-bookings">My Bookings</NavLink>
            <span className="nav-greeting">Hi, {user.name.split(' ')[0]}</span>
            <button className="btn-ghost" onClick={handleLogout}
              style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/signup" style={{
              background: 'var(--accent)', color: 'white',
              padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)',
              fontWeight: 600, fontSize: '0.875rem'
            }}>
              Sign up
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}