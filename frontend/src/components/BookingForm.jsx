import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../api/client';

const dailyInitial  = { start_date: '', end_date: '', purpose: '' };
const hourlyInitial = { date: '', start_time: '', end_time: '', purpose: '' };

export default function BookingForm({ listingId, pricePerDay, pricePerHour }) {
  const { user } = useAuth();
  const [bookingType, setBookingType] = useState('daily');
  const [daily,  setDaily]  = useState(dailyInitial);
  const [hourly, setHourly] = useState(hourlyInitial);
  const [status, setStatus] = useState({ type: '', message: '' });

  // ── cost preview ────────────────────────────────────────────────────────

  function numDays() {
    if (!daily.start_date || !daily.end_date) return 0;
    return Math.max(0, (new Date(daily.end_date) - new Date(daily.start_date)) / 86400000);
  }

  function numHours() {
    if (!hourly.start_time || !hourly.end_time) return 0;
    const [sh, sm] = hourly.start_time.split(':').map(Number);
    const [eh, em] = hourly.end_time.split(':').map(Number);
    return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
  }

  const estimatedCost =
    bookingType === 'daily'
      ? numDays()  * (pricePerDay  || 0)
      : numHours() * (pricePerHour || 0);

  // ── submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!user) {
      setStatus({ type: 'error', message: 'You must be logged in to book.' });
      return;
    }

    try {
      const payload =
        bookingType === 'daily'
          ? {
              listing_id:   Number(listingId),
              booking_type: 'daily',
              start_date:   daily.start_date,
              end_date:     daily.end_date,
              purpose:      daily.purpose,
            }
          : {
              listing_id:   Number(listingId),
              booking_type: 'hourly',
              start_date:   hourly.date,
              end_date:     hourly.date,        // same day for hourly
              start_time:   hourly.start_time,
              end_time:     hourly.end_time,
              purpose:      hourly.purpose,
            };

      await createBooking(payload);
      setStatus({ type: 'success', message: 'Booking request submitted!' });
      setDaily(dailyInitial);
      setHourly(hourlyInitial);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not submit booking.' });
    }
  }

  // ── render ───────────────────────────────────────────────────────────────

  const tabStyle = (active) => ({
    flex: 1,
    padding: '0.45rem',
    borderRadius: 8,
    border: '2px solid',
    borderColor: active ? 'var(--accent)' : 'var(--border)',
    background:  active ? 'var(--accent)' : 'transparent',
    color:       active ? '#fff' : 'var(--ink-2)',
    fontWeight: 600,
    cursor: 'pointer',
  });

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h3>Request this space</h3>

      {/* Toggle tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button type="button" style={tabStyle(bookingType === 'daily')}
          onClick={() => setBookingType('daily')}>
          By day · ${pricePerDay}/day
        </button>

        {/* Only show hourly tab if listing supports it */}
        {pricePerHour != null && (
          <button type="button" style={tabStyle(bookingType === 'hourly')}
            onClick={() => setBookingType('hourly')}>
            By hour · ${pricePerHour}/hr
          </button>
        )}
      </div>

      {/* Daily fields */}
      {bookingType === 'daily' && (
        <>
          <label>
            Start date
            <input type="date" required value={daily.start_date}
              onChange={e => setDaily(p => ({ ...p, start_date: e.target.value }))} />
          </label>
          <label>
            End date
            <input type="date" required value={daily.end_date}
              min={daily.start_date || undefined}
              onChange={e => setDaily(p => ({ ...p, end_date: e.target.value }))} />
          </label>
        </>
      )}

      {/* Hourly fields */}
      {bookingType === 'hourly' && (
        <>
          <label>
            Date
            <input type="date" required value={hourly.date}
              onChange={e => setHourly(p => ({ ...p, date: e.target.value }))} />
          </label>
          <label>
            Start time
            <input type="time" required value={hourly.start_time}
              onChange={e => setHourly(p => ({ ...p, start_time: e.target.value }))} />
          </label>
          <label>
            End time
            <input type="time" required value={hourly.end_time}
              min={hourly.start_time || undefined}
              onChange={e => setHourly(p => ({ ...p, end_time: e.target.value }))} />
          </label>
        </>
      )}

      {/* Purpose (shared) */}
      <label>
        Purpose
        <input type="text" required
          placeholder="Wedding, pop-up office, storage..."
          value={bookingType === 'daily' ? daily.purpose : hourly.purpose}
          onChange={e =>
            bookingType === 'daily'
              ? setDaily(p  => ({ ...p, purpose: e.target.value }))
              : setHourly(p => ({ ...p, purpose: e.target.value }))
          }
        />
      </label>

      {/* Live cost estimate */}
      {estimatedCost > 0 && (
        <p style={{ margin: '0.25rem 0 0.75rem', fontWeight: 700, color: 'var(--accent)' }}>
          Estimated total: ${estimatedCost.toFixed(2)}
          <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: '0.8rem', marginLeft: 6 }}>
            ({bookingType === 'daily'
              ? `${numDays()} day${numDays() !== 1 ? 's' : ''}`
              : `${numHours()} hr${numHours() !== 1 ? 's' : ''}`})
          </span>
        </p>
      )}

      <button type="submit">Submit booking</button>
      {status.message && <p className={status.type}>{status.message}</p>}
    </form>
  );
}