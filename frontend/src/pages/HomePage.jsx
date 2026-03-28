import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="hero">
      <div>
        <span className="pill">Hackathon MVP</span>
        <h1>Book unique non-residential spaces in minutes.</h1>
        <p>
          OpenSpot helps people discover venues, offices, and storage spaces that are flexible,
          short-term, and easy to request online.
        </p>
        <div className="actions">
          <Link to="/listings" className="button-link primary">Browse spaces</Link>
          <Link to="/host/create" className="button-link secondary">List your space</Link>
        </div>
      </div>
    </section>
  );
}
