import React, { useState } from 'react';
import { api } from '../api';
import EditProductModal from './EditProductModal';

export default function ProductList({ stockData, onChange }) {
  const [editingProduct, setEditingProduct] = useState(null);

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleSave = async (id, updatedFields) => {
    const { name, price, company, description, upc, quantity, date } = updatedFields;

    // Update product
    await api.put(`/products/${id}`, { name, price, company, description, upc });

    // Update quantity and date
    await api.post('/stock/set', { product_id: id, quantity: parseInt(quantity, 10), date: date });

    setEditingProduct(null);
    if (onChange) onChange();
  };


  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await api.delete(`/products/${productId}`);
      if (onChange) onChange();
    }
  };

  return (
    <div>
      <h2>📦 Product Inventory</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Stock</th>
            <th>Date Purchased</th>
            <th>Price</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stockData.map(row => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.company}</td>
              <td>{row.quantity}</td>
              <td>
                {(() => {
                  const d = new Date(row.bought_at);
                  return !d ? 'Invalid date' : d.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });
                })()}
              </td>
              <td>${row.price}</td>
              <td>${row.stock_value ? Number(row.stock_value).toFixed(2) : '0.00'}</td>
              <td>
                <button onClick={() => handleEdit(row)}>Edit</button>
                <button onClick={() => handleDelete(row.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Show modal if editing */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
