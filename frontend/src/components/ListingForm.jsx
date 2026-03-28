import { useState } from 'react';
import { createListing } from '../api/client';

const initialState = {
  title: '',
  description: '',
  category: 'event venue',
  city: '',
  address: '',
  price_per_day: 0,
  capacity: 0,
  size_sqft: 0,
  amenities: '',
  image_url: '',
  owner_id: 1
};

export default function ListingForm() {
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
      await createListing({
        ...formData,
        price_per_day: Number(formData.price_per_day),
        capacity: Number(formData.capacity),
        size_sqft: Number(formData.size_sqft),
        amenities: formData.amenities.split(',').map((item) => item.trim()).filter(Boolean)
      });
      setStatus({ type: 'success', message: 'Listing created successfully.' });
      setFormData(initialState);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not create listing.' });
    }
  }

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <h2>Create a listing</h2>
      <label>
        Title
        <input name="title" value={formData.title} onChange={handleChange} required />
      </label>
      <label>
        Category
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="event venue">Event venue</option>
          <option value="office">Office</option>
          <option value="storage">Storage</option>
        </select>
      </label>
      <label className="full-width">
        Description
        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required />
      </label>
      <label>
        City
        <input name="city" value={formData.city} onChange={handleChange} required />
      </label>
      <label>
        Address
        <input name="address" value={formData.address} onChange={handleChange} required />
      </label>
      <label>
        Price per day
        <input type="number" name="price_per_day" value={formData.price_per_day} onChange={handleChange} min="0" required />
      </label>
      <label>
        Capacity
        <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="0" required />
      </label>
      <label>
        Size (sqft)
        <input type="number" name="size_sqft" value={formData.size_sqft} onChange={handleChange} min="0" required />
      </label>
      <label className="full-width">
        Amenities (comma-separated)
        <input
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          placeholder="parking, chairs, wifi"
        />
      </label>
      <label className="full-width">
        Image URL
        <input name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." required />
      </label>
      <button type="submit" className="full-width">Create listing</button>
      {status.message ? <p className={`${status.type} full-width`}>{status.message}</p> : null}
    </form>
  );
}
