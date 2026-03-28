import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getBookings, getListing, cancelBooking } from '../api/client';

const STATUS_STYLES = {
  pending:   { color: '#b45309', background: '#fef3c7' },
  approved:  { color: '#0f8a4b', background: '#dcfce7' },
  declined:  { color: '#c0392b', background: '#fee2e2' },
  cancelled: { color: '#64748b', background: '#f1f5f9' },
};

export default function MyBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null); // booking id being cancelled

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    async function load() {
      try {
        const data = await getBookings({ user_id: user.id });
        setBookings(data);

        // Fetch listing details for each unique listing_id
        const ids = [...new Set(data.map(b => b.listing_id))];
        const listingMap = {};
        await Promise.all(
          ids.map(async id => {
            try {
              listingMap[id] = await getListing(id);
            } catch {
              // listing may have been deleted — just skip
            }
          })
        );
        setListings(listingMap);
      } catch (e) {
        setError('Could not load your bookings.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function handleCancel(bookingId) {
    if (!window.confirm('Cancel this booking request?')) return;
    setCancelling(bookingId);
    try {
      const updated = await cancelBooking(bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
    } catch (e) {
      alert(e.message);
    } finally {
      setCancelling(null);
    }
  }

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-3)' }}>Loading…</div>;
  if (error) return <div style={{ padding: '3rem', textAlign: 'center', color: '#c0392b' }}>{error}</div>;

  return (
    <div>
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <p style={{ color: 'var(--ink-3)' }}>You haven't made any booking requests yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map(b => {
            const listing = listings[b.listing_id];
            const style = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
            const canCancel = b.status === 'pending' || b.status === 'approved';

            return (
              <div
                key={b.id}
                className="panel"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>
                    {listing ? listing.title : `Listing #${b.listing_id}`}
                  </strong>
                  {listing && (
                    <p style={{ margin: '0.2rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                      {listing.city} · ${listing.price_per_day}/day
                    </p>
                  )}
                  <p style={{ margin: '0.25rem 0' }}>{b.start_date} → {b.end_date}</p>
                  <p style={{ margin: 0, color: '#64748b' }}>Purpose: {b.purpose}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={cancelling === b.id}
                      className="btn-ghost"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
                    >
                      {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                  <span
                    style={{
                      ...style,
                      padding: '0.4rem 1rem',
                      borderRadius: 999,
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}