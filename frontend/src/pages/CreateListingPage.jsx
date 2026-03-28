import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';

export default function CreateListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(!user);
  const [form, setForm] = useState({
    title: '', description: '', category: '', city: '',
    address: '', price_per_day: '', capacity: '', size_sqft: '',
    amenities: '', image_url: '',
  });
  const [status, setStatus] = useState('');

  function set(field) {
    return e => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) { setShowModal(true); return; }
    setStatus('');
    const payload = {
      ...form,
      price_per_day: parseFloat(form.price_per_day),
      capacity: parseInt(form.capacity),
      size_sqft: parseInt(form.size_sqft),
      amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      owner_id: user.id,
    };
    try {
      const res = await fetch('http://127.0.0.1:8000/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { setStatus('error'); return; }
      setStatus('success');
      setTimeout(() => navigate('/listings'), 1500);
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      {showModal && <LoginModal onClose={() => { setShowModal(false); navigate(-1); }} />}
      <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="page-header">
          <h1>List Your Space</h1>
          <p>Fill in the details and start receiving booking requests</p>
        </div>
        <div className="panel">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-grid">
              <label>Title<input required placeholder="e.g. Bright Downtown Loft" value={form.title} onChange={set('title')} /></label>
              <label>Category<input required placeholder="office, event venue, storage…" value={form.category} onChange={set('category')} /></label>
              <label>City<input required placeholder="Toronto" value={form.city} onChange={set('city')} /></label>
              <label>Address<input required placeholder="123 Main St" value={form.address} onChange={set('address')} /></label>
              <label>Price per day ($)<input required type="number" min="0" placeholder="250" value={form.price_per_day} onChange={set('price_per_day')} /></label>
              <label>Capacity (people)<input required type="number" min="1" placeholder="20" value={form.capacity} onChange={set('capacity')} /></label>
              <label>Size (sqft)<input required type="number" min="0" placeholder="900" value={form.size_sqft} onChange={set('size_sqft')} /></label>
              <label>Image URL<input placeholder="https://…" value={form.image_url} onChange={set('image_url')} /></label>
              <label className="full-width">
                Amenities (comma separated)
                <input placeholder="wifi, parking, coffee" value={form.amenities} onChange={set('amenities')} />
              </label>
              <label className="full-width">
                Description
                <textarea required rows={4} placeholder="Describe your space…" value={form.description} onChange={set('description')} />
              </label>
            </div>
            {status === 'success' && <p className="success">✓ Listing created! Redirecting…</p>}
            {status === 'error' && <p className="error">Something went wrong. Try again.</p>}
            <button type="submit" style={{ alignSelf: 'flex-start', paddingLeft: '2rem', paddingRight: '2rem' }}>
              Publish Listing
            </button>
          </form>
        </div>
      </div>
    </>
  );
}