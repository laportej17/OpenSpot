import { useState } from 'react';
import { createBooking } from '../api/client';

const initialState = {
  user_id: 1,
  start_date: '',
  end_date: '',
  purpose: ''
};

export default function BookingForm({ listingId }) {
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState({ type: '', message: '' });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      await createBooking({
        ...formData,
        listing_id: Number(listingId)
      });
      setStatus({ type: 'success', message: 'Booking request submitted.' });
      setFormData(initialState);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not submit booking.' });
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h3>Request this space</h3>
      <label>
        Start date
        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
      </label>
      <label>
        End date
        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
      </label>
      <label>
        Purpose
        <input
          type="text"
          name="purpose"
          placeholder="Wedding, pop-up office, storage..."
          value={formData.purpose}
          onChange={handleChange}
          required
        />
      </label>
      <button type="submit">Submit booking</button>
      {status.message ? <p className={status.type}>{status.message}</p> : null}
    </form>
  );
}
