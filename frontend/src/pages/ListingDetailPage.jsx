import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import BookingForm from '../components/BookingForm';
import { getListing } from '../api/client';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

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
            {listing.owner_name && (
              <div className="detail-meta-item"><strong>Listed by</strong><span>{listing.owner_name}</span></div>
            )}
            {listing.owner_email && (
              <div className="detail-meta-item"><strong>Contact</strong><span>{listing.owner_email}</span></div>
            )}
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
              {listing.price_per_hour != null && (
                <span style={{ color: 'var(--ink-3)', fontSize: '0.9rem', marginLeft: 8 }}>
                  · ${listing.price_per_hour} / hr
                </span>
              )}
            </div>
            <div className="divider" />

            {isOwner ? (
              <p style={{ color: 'var(--ink-3)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
                This is your listing — you can't book your own space.
              </p>
            ) : (
              <BookingForm
                listingId={listing.id}
                pricePerDay={listing.price_per_day}
                pricePerHour={listing.price_per_hour}
              />
            )}
          </div>
        </div>

      </div>
    </>
  );
}