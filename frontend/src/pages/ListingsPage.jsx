import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/listings')
      .then(r => r.json())
      .then(setListings);
  }, []);

  const filtered = listings.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.city.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Browse Spaces</h1>
        <p>Find the perfect space for your next event, project, or need</p>
      </div>

      <div style={{ marginBottom: '1.75rem' }}>
        <input
          placeholder="Search by name, city, or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 480, fontSize: '0.95rem' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '2rem' }}>🔍</p>
          <p>No spaces match your search.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(l => (
            <Link to={`/listings/${l.id}`} key={l.id}>
              <div className="card">
                <img className="card-image" src={l.image_url} alt={l.title} />
                <div className="card-body">
                  <span className="pill subtle">{l.category}</span>
                  <h3>{l.title}</h3>
                  <p>{l.city}</p>
                  <div className="card-footer">
                    <span className="card-price">${l.price_per_day}<span>/day</span></span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>{l.capacity} people</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}