import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import { createListing, uploadImage } from '../api/client';

const CATEGORIES = ['event venue', 'office', 'storage', 'studio'];

function ImageUploader({ urls, onChange }) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const cloudinaryReady = cloudName && uploadPreset;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [urlInput, setUrlInput] = useState('');

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadImage(file);
      onChange([...urls, url]);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function addUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange([...urls, trimmed]);
    setUrlInput('');
  }

  function removeUrl(index) {
    onChange(urls.filter((_, i) => i !== index));
  }

  function moveUp(index) {
    if (index === 0) return;
    const next = [...urls];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index) {
    if (index === urls.length - 1) return;
    const next = [...urls];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  return (
    <div className="full-width" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Photos</label>

      {/* Existing images */}
      {urls.map((url, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-2)', borderRadius: 8, padding: '0.5rem' }}>
          <img src={url} alt="" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: '0.75rem', color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
          <button type="button" onClick={() => moveUp(i)} disabled={i === 0} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', fontSize: '0.85rem' }}>↑</button>
          <button type="button" onClick={() => moveDown(i)} disabled={i === urls.length - 1} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', fontSize: '0.85rem' }}>↓</button>
          <button type="button" onClick={() => removeUrl(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: '1.1rem', padding: '0 4px' }}>×</button>
        </div>
      ))}

      {/* Add by URL */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          placeholder="Paste image URL and press +"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
          style={{ flex: 1 }}
        />
        <button type="button" onClick={addUrl} style={{ padding: '0 1rem', flexShrink: 0 }}>+</button>
      </div>

      {/* Upload file */}
      {cloudinaryReady && (
        <>
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ fontSize: '0.875rem' }} />
          {uploading && <p style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>Uploading…</p>}
        </>
      )}
      {uploadError && <p className="error">{uploadError}</p>}
      {urls.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>Add at least one image.</p>}
    </div>
  );
}

const initialForm = {
  title: '',
  description: '',
  category: 'event venue',
  city: '',
  address: '',
  price_per_day: '',
  price_per_hour: '',
  capacity: '',
  size_sqft: '',
  amenities: '',
  image_urls: [],
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
    if (form.image_urls.length === 0) {
      setStatus('error');
      setErrMsg('Please add at least one image.');
      return;
    }
    setStatus('');
    setErrMsg('');
    setSubmitting(true);
    try {
      await createListing({
        ...form,
        price_per_day: parseFloat(form.price_per_day),
        price_per_hour: form.price_per_hour === '' ? null : parseFloat(form.price_per_hour),
        capacity: parseInt(form.capacity),
        size_sqft: parseInt(form.size_sqft),
        amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
        image_url: form.image_urls[0],
        image_urls: form.image_urls,
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
      {showModal && <LoginModal onClose={() => { setShowModal(false); navigate(-1); }} />}
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
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
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
                Price per hour ($ · optional)
                <input type="number" min="0" step="0.01" placeholder="Leave blank to disable hourly booking" value={form.price_per_hour} onChange={set('price_per_hour')} />
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
                <textarea required rows={4} placeholder="Describe your space…" value={form.description} onChange={set('description')} />
              </label>
              <ImageUploader
                urls={form.image_urls}
                onChange={urls => setForm(f => ({ ...f, image_urls: urls }))}
              />
            </div>
            {status === 'success' && <p className="success">✓ Listing created! Redirecting…</p>}
            {status === 'error' && <p className="error">{errMsg}</p>}
            <button type="submit" disabled={submitting} style={{ alignSelf: 'flex-start', paddingLeft: '2rem', paddingRight: '2rem' }}>
              {submitting ? 'Publishing…' : 'Publish Listing'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}