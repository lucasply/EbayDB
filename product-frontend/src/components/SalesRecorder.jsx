import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function SaleRecorder({ products, onChange }) {
  const [form, setForm] = useState({ product_id: '', quantity: '', sold_price: '', revenue: '', date: '' });

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await api.post('/sold', form);

    // If the response is successful
    if (response.data.success) {
      alert('Sale recorded!');
      setForm({ product_id: '', quantity: '', sold_price: '', revenue: '', date: '' }); // Reset form
      if (onChange) onChange(); // Refresh product data
    } else {
      // Handle cases where `success: false` is returned
      alert(`Failed: ${response.data.message}`);
    }
  } catch (error) {
      // Handle HTTP errors (like status 400)
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };



  return (
    <form onSubmit={handleSubmit}>
      <h2>🛒 Record Sale</h2>
      <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} required>
        <option value="">Select Product</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name} ({p.company})</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Quantity"
        value={form.quantity}
        onChange={e => setForm({ ...form, quantity: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Sold Price"
        value={form.sold_price}
        onChange={e => setForm({ ...form, sold_price: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Revenue"
        value={form.revenue}
        onChange={e => setForm({ ...form, revenue: e.target.value })}
        required
      />
      <input
        type="date"
        placeholder="Sell Date"
        value={form.date}
        onChange={e => setForm({ ...form, date: e.target.value })}
        required
      />
      <button type="submit">Record Sale</button>
    </form>
  );
}
