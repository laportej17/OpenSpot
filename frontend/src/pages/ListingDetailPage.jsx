import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [form, setForm] = useState({ start_date: '', end_date: '', purpose: '' });
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/listings/${id}`)
      .then(r => r.json())
      .then(setListing);
  }, [id]);

  if (!listing) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--ink-3)' }}>Loading…</div>
  );

  const isOwner = user && user.id === listing.owner_id;

  async function handleBooking(e) {
    e.preventDefault();
    if (!user) { setShowModal(true); return; }
    if (isOwner) return;
    setStatus('');
    try {
      const res = await fetch('http://127.0.0.1:8000/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          user_id: user.id,
          start_date: form.start_date,
          end_date: form.end_date,
          purpose: form.purpose,
        }),
      });
      if (!res.ok) { setStatus('error'); return; }
      setStatus('success');
      setForm({ start_date: '', end_date: '', purpose: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
      <div className="fade-in detail-layout">
        <div>
          <img className="detail-image" src={listing.image_url} alt={listing.title} />
          <span className="pill subtle">{listing.category}</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: '0.75rem 0 0.5rem', letterSpacing: '-0.02em' }}>
            {listing.title}
          </h1>
          <p style={{ color: 'var(--ink-2)', lineHeight: 1.75, marginBottom: '1.5rem' }}>{listing.description}</p>

          <div className="detail-meta">
            <div className="detail-meta-item"><strong>City</strong><span>{listing.city}</span></div>
            <div className="detail-meta-item"><strong>Address</strong><span>{listing.address}</span></div>
            <div className="detail-meta-item"><strong>Capacity</strong><span>{listing.capacity} people</span></div>
            <div className="detail-meta-item"><strong>Size</strong><span>{listing.size_sqft} sqft</span></div>
          </div>

          {listing.amenities?.length > 0 && (
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink-2)', marginBottom: '0.5rem' }}>Amenities</p>
              <div className="amenities-list">
                {listing.amenities.map(a => <span className="pill" key={a}>{a}</span>)}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="panel" style={{ position: 'sticky', top: '80px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>
                ${listing.price_per_day}
              </span>
              <span style={{ color: 'var(--ink-3)', fontSize: '0.9rem' }}> / day</span>
            </div>
            <div className="divider" />

            {isOwner ? (
              <p style={{ color: 'var(--ink-3)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
                This is your listing — you can't book your own space.
              </p>
            ) : (
              <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label>
                  Start Date
                  <input type="date" required value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })} />
                </label>
                <label>
                  End Date
                  <input type="date" required value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })} />
                </label>
                <label>
                  Purpose
                  <textarea rows={3} required placeholder="What will you use this space for?"
                    value={form.purpose}
                    onChange={e => setForm({ ...form, purpose: e.target.value })} />
                </label>
                {status === 'success' && <p className="success">✓ Request sent! Check My Bookings for updates.</p>}
                {status === 'error' && <p className="error">Something went wrong. Try again.</p>}
                <button type="submit">Request to Book</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}