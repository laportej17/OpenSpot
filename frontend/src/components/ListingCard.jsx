import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  return (
    <article className="card">
      <img src={listing.image_url} alt={listing.title} className="card-image" />
      <div className="card-body">
        <span className="pill">{listing.category}</span>
        <h3>{listing.title}</h3>
        <p>{listing.city}</p>
        <p>{listing.description}</p>
        <div className="card-footer">
          <strong>${listing.price_per_day}/day</strong>
          <Link to={`/listings/${listing.id}`}>View details</Link>
        </div>
      </div>
    </article>
  );
}
