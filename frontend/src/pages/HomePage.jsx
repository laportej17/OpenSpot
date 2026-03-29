import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { label: 'Event Venue', emoji: '🎉', desc: 'Barns, halls, rooftops' },
  { label: 'Office', emoji: '💼', desc: 'Desks, meeting rooms, suites' },
  { label: 'Storage', emoji: '📦', desc: 'Units, warehouses, lockers' },
  { label: 'Studio', emoji: '🎨', desc: 'Photo, music, art' },
];

function AnimatedHeading({ text }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          className="hero-word"
          style={{ animationDelay: `${0.1 + i * 0.08}s`, marginRight: '0.25em' }}
        >
          {word}
        </span>
      ))}
    </>
  );
}

export default function HomePage() {
  const heroRef = useRef(null);

  useEffect(() => {
    function handleScroll() {
      const bg = heroRef.current?.querySelector('.hero-bg');
      if (!bg) return;
      const scrollY = window.scrollY;
      bg.style.transform = `translateY(${scrollY * 0.35}px)`;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Hero */}
      <div className="hero fade-in" ref={heroRef}>
        <div className="hero-bg" />
        <p className="hero-eyebrow">The space rental marketplace</p>
        <h1>
          <AnimatedHeading text="Rent any space," />
          <br />
          <AnimatedHeading text="for any purpose" />
        </h1>
        <p className="reveal" style={{ transitionDelay: '0.45s' }}>
          From intimate offices to sprawling event venues — find and book unique
          spaces from hosts in your city, on your schedule.
        </p>
        <div className="actions reveal" style={{ transitionDelay: '0.55s' }}>
          <Link to="/listings" className="button-link primary">Browse spaces</Link>
          <Link to="/host/create" className="button-link secondary">List your space</Link>
        </div>
      </div>

      {/* Categories */}
      <div className="reveal">
        <div className="section-heading">
          <h2>Browse by category</h2>
          <p>Find exactly the kind of space you need</p>
        </div>
        <div
          className="reveal-stagger"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}
        >
          {CATEGORIES.map(cat => (
            /* We use a specific class on the Link to ensure it behaves like a block */
            <Link 
              to={`/listings?category=${cat.label.toLowerCase()}`} 
              key={cat.label}
              className="category-link"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{cat.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{cat.label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>{cat.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        className="card reveal" 
        style={{ background: 'var(--accent-bg)', border: '1px solid #f0cdb8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', padding: '2rem' }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.35rem' }}>Have a space to share?</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: '0.95rem' }}>List it on OpenSpot and start earning.</p>
        </div>
        <Link to="/host/create" className="button-link primary">Get started →</Link>
      </div>

    </div>
  );
}