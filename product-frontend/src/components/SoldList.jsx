import React, { useState } from 'react';
import EditSellModal from './EditSellModal';
import { api } from '../api';

export default function SoldList({ sales, currentPage, totalItems, onPageChange, onChange }) {
  const [editingProduct, setEditingProduct] = useState(null);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleSave = async (product, updatedFields) => {
    const { name, PurchaseDate, SoldDate, PurchasePrice, SoldPrice, quantity } = updatedFields;
    const productId = product.product_id;
    const soldId = product.id;

    await api.put(`/products/${productId}`, { name, price: PurchasePrice });
    await api.post('/stock/set2', { product_id: productId, date: PurchaseDate });
    await api.post('/sold/set', { id: soldId, quantity: parseInt(quantity, 10), sold_price: SoldPrice, date: SoldDate });

    setEditingProduct(null);
    if (onChange) onChange();
  };

  const handleDelete = async (Id) => {
    if (window.confirm("Are you sure you want to delete this Sale?")) {
      await api.delete(`/sold/${Id}`);
      if (onChange) onChange();
    }
  };

  return (
    <div>
      <h2>📈 Sales History</h2>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Company</th>
              <th>Purchased on</th>
              <th>Sold on</th>
              <th>Paid</th>
              <th>Sold</th>
              <th>Amount</th>
              <th>Revenue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(sales || []).map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.company}</td>
                <td>{row.purchase_date ? new Date(row.purchase_date).toLocaleDateString() : 'N/A'}</td>
                <td>{new Date(row.sold_at).toLocaleDateString()}</td>
                <td>${Number(row.purchased_price || 0).toFixed(2)}</td>
                <td>${Number(row.sold_price || 0).toFixed(2)}</td>
                <td>{row.quantity}</td>
                <td>${(Number(row.sold_price) * row.quantity - (row.purchased_price * row.quantity)).toFixed(2)}</td>
                <td className="action-buttons">
                  <button onClick={() => handleEdit(row)}>Edit</button>
                  <button onClick={() => handleDelete(row.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls */}
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
        <EditSellModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
