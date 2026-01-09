import React, { useState } from 'react';
import { api } from '../api';

export default function AddProductForm({  onChange, setProductPage, setHighlightedProductId, refreshPaginatedProducts  }) {
  const [form, setForm] = useState({ name: '', price: '', company: '', upc: '', quantity: '', date: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/products', form);

      if (response.data.success) {
        // Success: reset form and notify parent
        alert('Product added!');
        setForm({ name: '', price: '', company: '', upc: '', quantity: '', date: '' });

        if (refreshPaginatedProducts) refreshPaginatedProducts(1);
        if (onChange) onChange();
      } else {
          if (response.data.page) {
            // Duplicate: optionally go to that page and highlight
            if (window.confirm(`${response.data.message}\nGo to this page?`)) {
              setProductPage(response.data.page);
              refreshPaginatedProducts(response.data.page);
              setHighlightedProductId(response.data.productId);
              
              setForm({ name: '', price: '', company: '', upc: '', quantity: '', date: '' });
              setTimeout(() => {
                setHighlightedProductId(null);
              }, 10000); 
            }
        }
        }
    } catch (error) {
      // HTTP errors or unexpected server response
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (!data.success && data.page) {
          if (window.confirm(`${data.message}\nGo to this page?`)) {
            setProductPage(data.page);             // Update page state
            refreshPaginatedProducts(data.page);   
            setHighlightedProductId(data.productId); 

            setTimeout(() => {
              setHighlightedProductId(null);
            }, 10000); 
          }
        } else if (data.message) {
          alert(`Error: ${data.message}`);
        } else {
          alert('An unexpected error occurred.');
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>➕ Add Product</h2>
      <input
        placeholder="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={e => setForm({ ...form, price: e.target.value })}
        required
      />
      <input
        placeholder="Company"
        value={form.company}
        onChange={e => setForm({ ...form, company: e.target.value })}
      />
      <input
        placeholder="Shelf"
        value={form.upc}
        onChange={e => setForm({ ...form, upc: e.target.value })}
      />
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
      <button type="submit">Add</button>
    </form>
  );
}
