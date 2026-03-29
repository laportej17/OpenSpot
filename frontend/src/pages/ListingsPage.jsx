import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getListings } from '../api/client';

const CATEGORIES = ['event venue', 'office', 'storage', 'studio'];

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = {};
        Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
        setSearchParams(params, { replace: true });
        const data = await getListings(filters);
        setListings(data);
      } catch (e) {
        setError('Could not load listings. Is the backend running?');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filters]);

  function set(field) {
    return e => setFilters(prev => ({ ...prev, [field]: e.target.value }));
  }

  function clearFilters() {
    setFilters({ category: '', city: '', min_price: '', max_price: '' });
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="fade-in">

      {/* Header */}
      <div className="page-header reveal">
        <h1>Browse Spaces</h1>
        <p>Find the perfect space for your next event, project, or need</p>
      </div>

      {/* Filter bar */}
      <div
        className="panel reveal"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          alignItems: 'end',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}>
          Category
          <select value={filters.category} onChange={set('category')}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}>
          City
          <input placeholder="e.g. Toronto" value={filters.city} onChange={set('city')} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}>
          Min price / day ($)
          <input type="number" min="0" placeholder="0" value={filters.min_price} onChange={set('min_price')} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}>
          Max price / day ($)
          <input type="number" min="0" placeholder="Any" value={filters.max_price} onChange={set('max_price')} />
        </label>

        {hasActiveFilters && (
          <button
            className="btn-ghost"
            onClick={clearFilters}
            style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', alignSelf: 'end' }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="empty-state"><p>Loading spaces…</p></div>
      )}

      {/* Error */}
      {error && (
        <div className="panel" style={{ color: 'var(--color-danger, #c0392b)', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && listings.length === 0 && (
        <div className="empty-state reveal">
          <p style={{ fontSize: '2rem' }}>🔍</p>
          <p>No spaces match your filters.</p>
          {hasActiveFilters && (
            <button className="btn-ghost" onClick={clearFilters} style={{ marginTop: '0.75rem' }}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {!loading && !error && listings.length > 0 && (
        <div className="card-grid reveal-stagger">
          {listings.map(l => (
            <Link to={`/listings/${l.id}`} key={l.id} style={{ textDecoration: 'none', color: 'inherit' }}>
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