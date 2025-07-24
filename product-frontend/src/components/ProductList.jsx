import React, { useState } from 'react';
import EditProductModal from './EditProductModal';
import { api } from '../api';

export default function ProductList({ stockData, currentPage, totalItems, onPageChange, onChange }) {
  const [editingProduct, setEditingProduct] = useState(null);
  const limit = 10;
  const totalPages = Math.ceil(totalItems / limit);

  const handleEdit = (product) => setEditingProduct(product);

  const handleSave = async (id, updatedFields) => {
    const { name, price, company, description, upc, quantity, date } = updatedFields;
    await api.put(`/products/${id}`, { name, price, company, description, upc });
    await api.post('/stock/set', { product_id: id, quantity: parseInt(quantity, 10), date });
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

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Stock</th>
              <th>Shelf</th>
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
                <td>{row.upc}</td>
                <td>{new Date(row.bought_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}</td>
                <td>${row.price}</td>
                <td>${row.stock_value ? Number(row.stock_value).toFixed(2) : '0.00'}</td>
                <td className="action-buttons">
                  <button onClick={() => handleEdit(row)}>Edit</button>
                  <button onClick={() => handleDelete(row.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-controls">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ← Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      </div>

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
