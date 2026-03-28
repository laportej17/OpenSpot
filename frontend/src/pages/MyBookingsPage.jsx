import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES = {
  pending:  { color: '#b45309', background: '#fef3c7' },
  approved: { color: '#0f8a4b', background: '#dcfce7' },
  declined: { color: '#c0392b', background: '#fee2e2' },
};

export default function MyBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState({});

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetch(`http://127.0.0.1:8000/bookings?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => {
        setBookings(data);
        const ids = [...new Set(data.map(b => b.listing_id))];
        ids.forEach(id =>
          fetch(`http://127.0.0.1:8000/listings/${id}`)
            .then(r => r.json())
            .then(l => setListings(prev => ({ ...prev, [id]: l })))
        );
      });
  }, [user]);

  return (
    <div>
      <h1>My Bookings</h1>
      {bookings.length === 0
        ? <p>You haven't made any booking requests yet.</p>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map(b => {
              const listing = listings[b.listing_id];
              const style = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
              return (
                <div className="panel" key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <strong>{listing ? listing.title : `Listing #${b.listing_id}`}</strong>
                    {listing && <p style={{ margin: '0.25rem 0', color: '#64748b' }}>{listing.city} · ${listing.price_per_day}/day</p>}
                    <p style={{ margin: '0.25rem 0' }}>{b.start_date} → {b.end_date}</p>
                    <p style={{ margin: 0, color: '#64748b' }}>Purpose: {b.purpose}</p>
                  </div>
                  <span style={{
                    ...style,
                    padding: '0.4rem 1rem',
                    borderRadius: 999,
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    fontSize: '0.9rem'
                  }}>
                    {b.status}
                  </span>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}