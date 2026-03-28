import { useEffect, useState } from 'react';
import { getListings } from '../api/client';
import ListingCard from '../components/ListingCard';

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadListings() {
      try {
        const data = await getListings();
        setListings(data);
      } catch (err) {
        setError(err.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  if (loading) return <p>Loading listings...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <section>
      <div className="section-heading">
        <h1>Browse spaces</h1>
        <p>Event venues, offices, and storage spaces from one marketplace.</p>
      </div>
      <div className="card-grid">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
