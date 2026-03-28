import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getListings,
  getBookings,
  updateBookingStatus,
  updateListing,
  deleteListing,
} from '../api/client';

const CATEGORIES = ['event venue', 'office', 'storage', 'studio'];

export default function MyListingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editTarget, setEditTarget] = useState(null); // listing being edited
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    async function load() {
      const [allListings, allBookings] = await Promise.all([
        getListings(),
        getBookings(),
      ]);
      setListings(allListings.filter(l => l.owner_id === user.id));
      setBookings(allBookings);
      setLoading(false);
    }
    load();
  }, [user]);

  // ── Approve / Decline ──────────────────────────────────────────────────────

  async function handleStatus(bookingId, status) {
    try {
      const updated = await updateBookingStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
    } catch (e) {
      alert(e.message);
    }
  }

  // ── Edit listing ───────────────────────────────────────────────────────────

  function openEdit(listing) {
    setEditTarget(listing);
    setEditForm({
      title: listing.title,
      description: listing.description,
      category: listing.category,
      city: listing.city,
      address: listing.address,
      price_per_day: listing.price_per_day,
      capacity: listing.capacity,
      size_sqft: listing.size_sqft,
      amenities: (listing.amenities || []).join(', '),
      image_url: listing.image_url,
    });
    setEditError('');
  }

  async function saveEdit(e) {
    e.preventDefault();
    setEditSaving(true);
    setEditError('');
    try {
      const payload = {
        ...editForm,
        price_per_day: parseFloat(editForm.price_per_day),
        capacity: parseInt(editForm.capacity),
        size_sqft: parseInt(editForm.size_sqft),
        amenities: editForm.amenities
          .split(',')
          .map(a => a.trim())
          .filter(Boolean),
      };
      const updated = await updateListing(editTarget.id, payload);
      setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
      setEditTarget(null);
    } catch (e) {
      setEditError(e.message);
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete listing ─────────────────────────────────────────────────────────

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteListing(deleteTarget.id);
      setListings(prev => prev.filter(l => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  }

  // ── Derived data ──────────────────────────────────────────────────────────

  const myIds = new Set(listings.map(l => l.id));
  const incoming = bookings.filter(b => myIds.has(b.listing_id));

  function listingTitle(id) {
    return listings.find(l => l.id === id)?.title || `Listing #${id}`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-3)' }}>Loading…</div>;

  return (
    <div>
      <h1>My Listings</h1>

      {listings.length === 0 && (
        <p style={{ color: 'var(--ink-3)', marginBottom: '2rem' }}>
          You haven't created any listings yet.
        </p>
      )}

      {/* ── Listing cards ── */}
      <div className="card-grid" style={{ marginBottom: '2.5rem' }}>
        {listings.map(l => (
          <div className="card" key={l.id}>
            <img className="card-image" src={l.image_url} alt={l.title} />
            <div className="card-body">
              <span className="pill subtle">{l.category}</span>
              <h3>{l.title}</h3>
              <p>{l.city}</p>
              <div className="card-footer" style={{ gap: '0.5rem' }}>
                <button
                  onClick={() => openEdit(l)}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(l)}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.8rem',
                    background: '#c0392b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Incoming bookings ── */}
      <h2>Incoming Booking Requests</h2>
      {incoming.length === 0 ? (
        <p style={{ color: 'var(--ink-3)' }}>No booking requests yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {incoming.map(b => (
            <div
              key={b.id}
              className="panel"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <strong>{listingTitle(b.listing_id)}</strong>
                <p style={{ margin: '0.25rem 0' }}>{b.start_date} → {b.end_date}</p>
                <p style={{ margin: 0, color: '#64748b' }}>Purpose: {b.purpose}</p>
                {/* Booker name now comes from the enriched API response */}
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                  From: {b.booker_name || `User #${b.user_id}`}
                  {b.booker_email ? ` (${b.booker_email})` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {b.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleStatus(b.id, 'approved')}
                      style={{ background: '#0f8a4b', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1rem', cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatus(b.id, 'declined')}
                      style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1rem', cursor: 'pointer' }}
                    >
                      Decline
                    </button>
                  </>
                ) : (
                  <span
                    className={b.status === 'approved' ? 'success' : 'error'}
                    style={{ fontWeight: 700, textTransform: 'capitalize' }}
                  >
                    {b.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit modal ── */}
      {editTarget && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
          }}
          onClick={() => setEditTarget(null)}
        >
          <div
            className="panel"
            style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1rem' }}>Edit Listing</h2>
            <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-grid">
                {[
                  ['Title', 'title', 'text'],
                  ['City', 'city', 'text'],
                  ['Address', 'address', 'text'],
                  ['Price per day ($)', 'price_per_day', 'number'],
                  ['Capacity', 'capacity', 'number'],
                  ['Size (sqft)', 'size_sqft', 'number'],
                  ['Image URL', 'image_url', 'text'],
                ].map(([label, field, type]) => (
                  <label key={field}>
                    {label}
                    <input
                      type={type}
                      value={editForm[field]}
                      onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                      required
                    />
                  </label>
                ))}

                <label>
                  Category
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>

                <label className="full-width">
                  Amenities (comma-separated)
                  <input
                    value={editForm.amenities}
                    onChange={e => setEditForm(f => ({ ...f, amenities: e.target.value }))}
                    placeholder="wifi, parking, coffee"
                  />
                </label>

                <label className="full-width">
                  Description
                  <textarea
                    rows={4}
                    value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    required
                  />
                </label>
              </div>

              {editError && <p className="error">{editError}</p>}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-ghost" onClick={() => setEditTarget(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={editSaving}>
                  {editSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="panel"
            style={{ maxWidth: 420, width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '0.5rem' }}>Delete listing?</h2>
            <p style={{ color: 'var(--ink-2)', marginBottom: '1.5rem' }}>
              "{deleteTarget.title}" will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                disabled={deleting}
                onClick={confirmDelete}
                style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1.25rem', cursor: 'pointer' }}
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}