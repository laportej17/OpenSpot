import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import BookingForm from '../components/BookingForm';
import { getListing } from '../api/client';

function ImageCarousel({ urls }) {
  const [current, setCurrent] = useState(0);
  if (!urls || urls.length === 0) return null;

  const prev = () => setCurrent(i => (i - 1 + urls.length) % urls.length);
  const next = () => setCurrent(i => (i + 1) % urls.length);

  return (
    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
      {/* Main image */}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#f0ede8' }}>
        <img
          src={urls[current]}
          alt={`Photo ${current + 1}`}
          style={{ width: '100%', height: 380, objectFit: 'cover', display: 'block', transition: 'opacity 0.2s' }}
        />
        {/* Arrows */}
        {urls.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%',
                width: 36, height: 36, fontSize: '1.1rem', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >‹</button>
            <button
              onClick={next}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%',
                width: 36, height: 36, fontSize: '1.1rem', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >›</button>
          </>
        )}
        {/* Image count badge */}
        {urls.length > 1 && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.5)', color: '#fff',
            fontSize: '0.75rem', fontWeight: 600,
            padding: '0.2rem 0.6rem', borderRadius: 999,
          }}>
            {current + 1} / {urls.length}
          </span>
        )}
      </div>

      {/* Dots */}
      {urls.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '0.75rem' }}>
          {urls.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 20 : 8,
                height: 8,
                borderRadius: 999,
                border: 'none',
                background: i === current ? 'var(--accent)' : 'var(--border)',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.2s, background 0.2s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
  const images = listing.image_urls?.length > 0 ? listing.image_urls : [listing.image_url];

  return (
    <>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
      <div className="fade-in detail-layout">

        {/* ── Left: listing info ── */}
        <div>
          <ImageCarousel urls={images} />
          <span className="pill subtle">{listing.category}</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: '0.75rem 0 0.5rem', letterSpacing: '-0.02em' }}>
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
            {listing.owner_name && <div className="detail-meta-item"><strong>Listed by</strong><span>{listing.owner_name}</span></div>}
            {listing.owner_email && <div className="detail-meta-item"><strong>Contact</strong><span>{listing.owner_email}</span></div>}
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

        {/* ── Right: booking panel ── */}
        <div>
          <div className="panel" style={{ position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>
                ${listing.price_per_day}
              </span>
              <div style={{ color: 'var(--ink-3)', fontSize: '0.9rem' }}>/ day</div>
              {listing.price_per_hour != null && (
                <div style={{ color: 'var(--ink-3)', fontSize: '0.9rem' }}>· ${listing.price_per_hour} / hr</div>
              )}
            </div>
            <div className="divider" />
            {isOwner ? (
              <p style={{ color: 'var(--ink-3)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
                This is your listing — you can't book your own space.
              </p>
            ) : (
              <BookingForm listingId={listing.id} pricePerDay={listing.price_per_day} pricePerHour={listing.price_per_hour} />
            )}
          </div>
        </div>

      </div>
    </>
  );
}