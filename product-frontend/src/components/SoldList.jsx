import React, { useEffect, useState } from 'react';
import { api } from '../api';
import EditSellModal from './EditSellModal';

export default function SoldList({ sales, onChange }) {
  

  const [editingProduct, setEditingProduct] = useState(null);
  
    const handleEdit = (product) => {
      setEditingProduct(product);
    };
  
    const handleSave = async (product, updatedFields) => {
      const { name, PurchaseDate, SoldDate, PurchasePrice, SoldPrice, quantity } = updatedFields;

      const productId = product.product_id; // for stock/sold tables
      const soldId = product.id;            // for updating sold by sold.id

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
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Company</th>
            <th>Purchase Date</th>
            <th>Sold Date</th>
            <th>Purchased Price</th>
            <th>Sold Price</th>
            <th>Quantity</th>
            <th>Total Revenue</th>
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
                <td>${(Number(row.sold_price) * row.quantity - ((row.purchased_price) * row.quantity)).toFixed(2)}</td>
                <td className="action-buttons">
                  <button onClick={() => handleEdit(row)}>Edit</button>
                  <button onClick={() => handleDelete(row.id)}>Delete</button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Show modal if editing */}
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
