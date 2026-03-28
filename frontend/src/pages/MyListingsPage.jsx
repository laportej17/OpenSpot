import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyListingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetch('http://127.0.0.1:8000/listings')
      .then(r => r.json())
      .then(data => setListings(data.filter(l => l.owner_id === user.id)));
    fetch('http://127.0.0.1:8000/bookings')
      .then(r => r.json())
      .then(setBookings);
  }, [user]);

  async function updateStatus(bookingId, status) {
    await fetch(`http://127.0.0.1:8000/bookings/${bookingId}/status?status=${status}`, {
      method: 'PATCH',
    });
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  }

  const myListingIds = new Set(listings.map(l => l.id));
  const incomingBookings = bookings.filter(b => myListingIds.has(b.listing_id));

  function getListingTitle(id) {
    return listings.find(l => l.id === id)?.title || `Listing #${id}`;
  }

  return (
    <div>
      <h1>My Listings</h1>

      {listings.length === 0 && <p>You haven't created any listings yet.</p>}

      <div className="card-grid" style={{ marginBottom: '2.5rem' }}>
        {listings.map(l => (
          <div className="card" key={l.id}>
            <img className="card-image" src={l.image_url} alt={l.title} />
            <div className="card-body">
              <span className="pill subtle">{l.category}</span>
              <h3>{l.title}</h3>
              <p>{l.city}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Incoming Booking Requests</h2>
      {incomingBookings.length === 0
        ? <p>No booking requests yet.</p>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {incomingBookings.map(b => (
              <div className="panel" key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <strong>{getListingTitle(b.listing_id)}</strong>
                  <p style={{ margin: '0.25rem 0' }}>{b.start_date} → {b.end_date}</p>
                  <p style={{ margin: 0, color: '#64748b' }}>Purpose: {b.purpose}</p>
                  <p style={{ margin: 0, color: '#64748b' }}>User ID: {b.user_id}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {b.status === 'pending' ? (
                    <>
                      <button onClick={() => updateStatus(b.id, 'approved')}
                        style={{ background: '#0f8a4b' }}>Approve</button>
                      <button onClick={() => updateStatus(b.id, 'declined')}
                        style={{ background: '#c0392b' }}>Decline</button>
                    </>
                  ) : (
                    <span className={b.status === 'approved' ? 'success' : 'error'}
                      style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                      {b.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}