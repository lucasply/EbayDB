import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function SaleRecorder() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: '', quantity: '', sold_price: '' });

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/sold', form);
    alert('Sale recorded!');
    setForm({ product_id: '', quantity: '', sold_price: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>🛒 Record Sale</h2>
      <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} required>
        <option value="">Select Product</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
      <input type="number" placeholder="Sold Price" value={form.sold_price} onChange={e => setForm({ ...form, sold_price: e.target.value })} required />
      <button type="submit">Record Sale</button>
    </form>
  );
}
