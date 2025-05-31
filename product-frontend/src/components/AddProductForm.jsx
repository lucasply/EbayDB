import React, { useState } from 'react';
import { api } from '../api';

export default function AddProductForm({ onChange }) {
  const [form, setForm] = useState({ name: '', price: '', company: '', description: '', upc: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/products', form);
    alert('Product added!');
    setForm({ name: '', price: '', company: '', description: '', upc: '' });
    if (onChange) onChange(); // notify parent to refresh
  
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>➕ Add Product</h2>
      <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
      <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
      <input placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
      <input placeholder="UPC" value={form.upc} onChange={e => setForm({ ...form, upc: e.target.value })} />
      <button type="submit">Add</button>
    </form>
  );
}
