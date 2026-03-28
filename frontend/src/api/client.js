const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return response.json();
}

export function getListings() {
  return request('/listings');
}

export function getListing(id) {
  return request(`/listings/${id}`);
}

export function createListing(payload) {
  return request('/listings', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function createBooking(payload) {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
