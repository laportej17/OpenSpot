const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function authHeaders() {
  const token = localStorage.getItem('openspot_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    ...restOptions,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const body = await response.json();
      message = body.detail || JSON.stringify(body);
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

// ── Listings ──────────────────────────────────────────────────────────────────

export function getListings(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  ).toString();
  return request(`/listings${qs ? '?' + qs : ''}`);
}

export function getListing(id) {
  return request(`/listings/${id}`);
}

export function createListing(payload) {
  return request('/listings', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function updateListing(id, payload) {
  return request(`/listings/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function deleteListing(id) {
  return request(`/listings/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export function getBookings(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  ).toString();
  return request(`/bookings${qs ? '?' + qs : ''}`);
}

export function createBooking(payload) {
  return request('/bookings', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function updateBookingStatus(id, status) {
  return request(`/bookings/${id}/status?status=${status}`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export function cancelBooking(id) {
  return request(`/bookings/${id}/cancel`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

// ── Auth / Profile ────────────────────────────────────────────────────────────

export function getMe() {
  return request('/auth/me', { headers: authHeaders() });
}

export function updateMe(payload) {
  return request('/auth/me', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

// ── Image upload (Cloudinary unsigned preset) ─────────────────────────────────

export async function uploadImage(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error('Cloudinary not configured');

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form }
  );
  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  return data.secure_url;
}