import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import { createListing, uploadImage } from '../api/client';

const CATEGORIES = ['event venue', 'office', 'storage', 'studio'];

// ── Image uploader sub-component ──────────────────────────────────────────────
// If VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET are set in
// frontend/.env, renders a file picker that uploads directly to Cloudinary.
// Otherwise falls back to a plain URL input field.

function ImageUploader({ value, onChange }) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const cloudinaryReady = cloudName && uploadPreset;

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  if (!cloudinaryReady) {
    // Fallback: plain URL input (original behaviour)
    return (
      <label className="full-width">
        Image URL
        <input
          placeholder="https://images.unsplash.com/..."
          value={value}
          onChange={e => onChange(e.target.value)}
          required
        />
      </label>
    );
  }

  return (
    <div className="full-width" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label>Photo</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
        style={{ fontSize: '0.875rem' }}
      />
      {uploading && <p style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>Uploading…</p>}
      {uploadError && <p className="error">{uploadError}</p>}
      {value && !uploading && (
        <img
          src={value}
          alt="Preview"
          style={{
            width: '100%',
            maxHeight: 200,
            objectFit: 'cover',
            borderRadius: 8,
            marginTop: 4,
          }}
        />
      )}
      {/* Also allow pasting a URL if upload doesn't suit */}
      <label style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--ink-3)' }}>
        Or paste an image URL
        <input
          placeholder="https://..."
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ fontSize: '0.85rem', marginTop: 4 }}
        />
      </label>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const initialForm = {
  title: '',
  description: '',
  category: 'event venue',
  city: '',
  address: '',
  price_per_day: '',
  capacity: '',
  size_sqft: '',
  amenities: '',
  image_url: '',
};

export default function CreateListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(!user);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) { setShowModal(true); return; }

    if (!form.image_url) {
      setStatus('error');
      setErrMsg('Please provide an image (upload or URL).');
      return;
    }

    setStatus('');
    setErrMsg('');
    setSubmitting(true);

    try {
      await createListing({
        ...form,
        price_per_day: parseFloat(form.price_per_day),
        capacity: parseInt(form.capacity),
        size_sqft: parseInt(form.size_sqft),
        amenities: form.amenities
          .split(',')
          .map(a => a.trim())
          .filter(Boolean),
        // owner_id is set by the backend from the JWT — no need to send it
      });
      setStatus('success');
      setTimeout(() => navigate('/my-listings'), 1500);
    } catch (err) {
      setStatus('error');
      setErrMsg(err.message || 'Could not create listing.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {showModal && (
        <LoginModal onClose={() => { setShowModal(false); navigate(-1); }} />
      )}

      <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="page-header">
          <h1>List Your Space</h1>
          <p>Fill in the details and start receiving booking requests</p>
        </div>

        <div className="panel">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-grid">
              <label>
                Title
                <input required placeholder="e.g. Bright Downtown Loft" value={form.title} onChange={set('title')} />
              </label>

              <label>
                Category
                <select value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </label>

              <label>
                City
                <input required placeholder="Toronto" value={form.city} onChange={set('city')} />
              </label>

              <label>
                Address
                <input required placeholder="123 Main St" value={form.address} onChange={set('address')} />
              </label>

              <label>
                Price per day ($)
                <input required type="number" min="0" placeholder="250" value={form.price_per_day} onChange={set('price_per_day')} />
              </label>

              <label>
                Capacity (people)
                <input required type="number" min="1" placeholder="20" value={form.capacity} onChange={set('capacity')} />
              </label>

              <label>
                Size (sqft)
                <input required type="number" min="0" placeholder="900" value={form.size_sqft} onChange={set('size_sqft')} />
              </label>

              <label className="full-width">
                Amenities (comma separated)
                <input placeholder="wifi, parking, coffee" value={form.amenities} onChange={set('amenities')} />
              </label>

              <label className="full-width">
                Description
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your space…"
                  value={form.description}
                  onChange={set('description')}
                />
              </label>

              {/* Image uploader — Cloudinary if configured, URL input otherwise */}
              <ImageUploader
                value={form.image_url}
                onChange={url => setForm(f => ({ ...f, image_url: url }))}
              />
            </div>

            {status === 'success' && <p className="success">✓ Listing created! Redirecting…</p>}
            {status === 'error' && <p className="error">{errMsg}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{ alignSelf: 'flex-start', paddingLeft: '2rem', paddingRight: '2rem' }}
            >
              {submitting ? 'Publishing…' : 'Publish Listing'}
            </button>
          </form>
        </div>

        {/* Cloudinary setup hint (only shown if not configured) */}
        {!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && (
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--ink-3)' }}>
            Tip: to enable photo uploads, add{' '}
            <code>VITE_CLOUDINARY_CLOUD_NAME</code> and{' '}
            <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> to{' '}
            <code>frontend/.env</code>.
          </p>
        )}
      </div>
    </>
  );
}