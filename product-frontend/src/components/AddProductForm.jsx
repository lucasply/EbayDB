import React, { useState } from 'react';
import { api } from '../api';

export default function AddProductForm() {
  const [form, setForm] = useState({ name: '', price: '', description: '', upc: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/products', form);
    alert('Product added!');
    setForm({ name: '', price: '', description: '', upc: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>➕ Add Product</h2>
      <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
      <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
      <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      <input placeholder="UPC (optional)" value={form.upc} onChange={e => setForm({ ...form, upc: e.target.value })} />
      <button type="submit">Add</button>
    </form>
  );
}
