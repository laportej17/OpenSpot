import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">OpenSpot</Link>
      <nav className="nav-links">
        <NavLink to="/listings">Browse Spaces</NavLink>
        <NavLink to="/host/create">Host a Space</NavLink>
      </nav>
    </header>
  );
}
