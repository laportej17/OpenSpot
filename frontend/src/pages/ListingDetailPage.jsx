import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import { getListing, createBooking } from '../api/client';

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const ms = new Date(end) - new Date(start);
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ start_date: '', end_date: '', purpose: '' });
  const [status, setStatus] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getListing(id);
        setListing(data);
      } catch {
        setError('Could not load this listing.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--ink-3)' }}>Loading…</div>;
  if (error || !listing) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--ink-3)' }}>{error || 'Listing not found.'}</div>;

  const isOwner = user && user.id === listing.owner_id;
  const nights = daysBetween(form.start_date, form.end_date);
  const total = nights * listing.price_per_day;

  async function handleBooking(e) {
    e.preventDefault();
    if (!user) { setShowModal(true); return; }
    if (isOwner) return;

    if (form.start_date >= form.end_date) {
      setStatus('error');
      setStatusMsg('End date must be after start date.');
      return;
    }

    setStatus('');
    setStatusMsg('');
    setSubmitting(true);
    try {
      await createBooking({
        listing_id: listing.id,
        start_date: form.start_date,
        end_date: form.end_date,
        purpose: form.purpose,
      });
      setStatus('success');
      setStatusMsg('✓ Request sent! Check My Bookings for updates.');
      setForm({ start_date: '', end_date: '', purpose: '' });
    } catch (err) {
      setStatus('error');
      setStatusMsg(err.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
      <div className="fade-in detail-layout">

        {/* ── Left: listing info ── */}
        <div>
          <img className="detail-image" src={listing.image_url} alt={listing.title} />
          <span className="pill subtle">{listing.category}</span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            margin: '0.75rem 0 0.5rem',
            letterSpacing: '-0.02em',
          }}>
            {listing.title}
          </h1>
          <p style={{ color: 'var(--ink-2)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
            {listing.description}
          </p>

          <div className="detail-meta">
            <div className="detail-meta-item"><strong>City</strong><span>{listing.city}</span></div>
            <div className="detail-meta-item"><strong>Address</strong><span>{listing.address}</span></div>
            <div className="detail-meta-item"><strong>Capacity</strong><span>{listing.capacity} people</span></div>
            <div className="detail-meta-item"><strong>Size</strong><span>{listing.size_sqft} sqft</span></div>
          </div>

          {listing.amenities?.length > 0 && (
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink-2)', marginBottom: '0.5rem' }}>
                Amenities
              </p>
              <div className="amenities-list">
                {listing.amenities.map(a => <span className="pill" key={a}>{a}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: booking panel ── */}
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
                  <input
                    type="date"
                    required
                    value={form.start_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                  />
                </label>
                <label>
                  End Date
                  <input
                    type="date"
                    required
                    value={form.end_date}
                    min={form.start_date || new Date().toISOString().split('T')[0]}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                  />
                </label>

                {/* ── Price calculator ── */}
                {nights > 0 && (
                  <div style={{
                    background: 'var(--bg-2, #f8f8f6)',
                    borderRadius: 8,
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)' }}>
                      <span>${listing.price_per_day} × {nights} day{nights !== 1 ? 's' : ''}</span>
                      <span>${(listing.price_per_day * nights).toLocaleString()}</span>
                    </div>
                    <div className="divider" style={{ margin: '0.3rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>Total</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <label>
                  Purpose
                  <textarea
                    rows={3}
                    required
                    placeholder="What will you use this space for?"
                    value={form.purpose}
                    onChange={e => setForm({ ...form, purpose: e.target.value })}
                  />
                </label>

                {status === 'success' && <p className="success">{statusMsg}</p>}
                {status === 'error' && <p className="error">{statusMsg}</p>}

                <button type="submit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Request to Book'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </>
  );
}