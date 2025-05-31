import React, { useState, useEffect } from 'react';
import { api } from '../api';
import EditProductModal from './EditProductModal';

export default function ProductList() {
  const [stockData, setStockData] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const fetchPage = async (page) => {
    const res = await api.get(`/products/paginated?page=${page}&limit=${limit}`);
    setStockData(res.data.data);
    setTotalItems(res.data.total);
  };

  useEffect(() => {
    fetchPage(currentPage);
  }, [currentPage]);

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleSave = async (id, updatedFields) => {
    const { name, price, company, description, upc, quantity, date } = updatedFields;
    await api.put(`/products/${id}`, { name, price, company, description, upc });
    await api.post('/stock/set', { product_id: id, quantity: parseInt(quantity, 10), date });
    setEditingProduct(null);
    fetchPage(currentPage);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await api.delete(`/products/${productId}`);
      fetchPage(currentPage);
    }
  };

  const totalPages = Math.ceil(totalItems / limit);

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
                <td>{new Date(row.bought_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</td>
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

        {/* Pagination now inside wrapper and styled properly */}
        <div className="pagination-controls">
          <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
            ← Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
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
