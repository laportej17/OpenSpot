import { Link } from 'react-router-dom';

const CATEGORIES = [
  { label: 'Event Venue', emoji: '🎉', desc: 'Barns, halls, rooftops' },
  { label: 'Office', emoji: '💼', desc: 'Desks, meeting rooms, suites' },
  { label: 'Storage', emoji: '📦', desc: 'Units, warehouses, lockers' },
  { label: 'Studio', emoji: '🎨', desc: 'Photo, music, art' },
];

export default function HomePage() {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div className="hero">
        <p className="hero-eyebrow">The space rental marketplace</p>
        <h1>Rent any space,<br />for any purpose</h1>
        <p>
          From intimate offices to sprawling event venues — find and book unique
          spaces from hosts in your city, on your schedule.
        </p>
        <div className="actions">
          <Link to="/listings" className="button-link primary">Browse spaces</Link>
          <Link to="/host/create" className="button-link secondary">List your space</Link>
        </div>
      </div>

      <div>
        <div className="section-heading">
          <h2>Browse by category</h2>
          <p>Find exactly the kind of space you need</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {CATEGORIES.map(cat => (
            <Link to={`/listings?category=${cat.label.toLowerCase()}`} key={cat.label}>
              <div className="panel" style={{
                textAlign: 'center', cursor: 'pointer',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{cat.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{cat.label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>{cat.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="panel" style={{ background: 'var(--accent-bg)', border: '1px solid #f0cdb8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.35rem' }}>Have a space to share?</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: '0.95rem' }}>List it on OpenSpot and start earning.</p>
        </div>
        <Link to="/host/create" className="button-link primary">Get started →</Link>
      </div>
    </div>
  );
}