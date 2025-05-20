import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function StockManager({ products, onChange }) {
  const [form, setForm] = useState({ product_id: '', quantity: '', date: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/stock/update', form);
    alert('Stock updated!');
    setForm({ product_id: '', quantity: '', date: '' });
    if (onChange) onChange(); // notify parent to refresh totals
  };


  return (
    <form onSubmit={handleSubmit}>
      <h2>📥 Add Stock</h2>
      <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} required>
        <option value="">Select Product</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
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
        type="date"
        placeholder="Date Purchased"
        value={form.date}
        onChange={e => setForm({ ...form, date: e.target.value })}
        required
      />
      <button type="submit">Update Stock</button>
    </form>
  );
}
