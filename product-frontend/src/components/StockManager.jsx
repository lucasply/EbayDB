import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function StockManager() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: '', quantity: '' });

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/stock/update', form);
    alert('Stock updated!');
    setForm({ product_id: '', quantity: '' });
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
      <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
      <button type="submit">Update Stock</button>
    </form>
  );
}
