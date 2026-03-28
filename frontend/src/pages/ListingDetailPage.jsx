import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getListing } from '../api/client';
import BookingForm from '../components/BookingForm';

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadListing() {
      try {
        const data = await getListing(id);
        setListing(data);
      } catch (err) {
        setError(err.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    }

    loadListing();
  }, [id]);

  if (loading) return <p>Loading listing...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!listing) return <p>Listing not found.</p>;

  return (
    <section className="detail-layout">
      <article className="panel">
        <img src={listing.image_url} alt={listing.title} className="detail-image" />
        <span className="pill">{listing.category}</span>
        <h1>{listing.title}</h1>
        <p>{listing.description}</p>
        <div className="detail-meta">
          <p><strong>City:</strong> {listing.city}</p>
          <p><strong>Address:</strong> {listing.address}</p>
          <p><strong>Capacity:</strong> {listing.capacity}</p>
          <p><strong>Size:</strong> {listing.size_sqft} sqft</p>
          <p><strong>Price:</strong> ${listing.price_per_day}/day</p>
        </div>
        <div>
          <strong>Amenities</strong>
          <div className="amenities-list">
            {listing.amenities.map((amenity) => (
              <span key={amenity} className="pill subtle">{amenity}</span>
            ))}
          </div>
        </div>
      </article>
      <BookingForm listingId={id} />
    </section>
  );
}
