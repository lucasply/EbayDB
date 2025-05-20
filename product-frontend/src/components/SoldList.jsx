import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function SoldList({ refreshKey }) {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    api.get('/sold/history')
      .then(res => setSales(res.data))
      .catch(err => console.error('Failed to load sales history:', err));
  }, [refreshKey]); 

  return (
    <div>
      <h2>📈 Sales History</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Purchase Date</th>
            <th>Sold Date</th>
            <th>Purchased Price</th>
            <th>Sold Price</th>
            <th>Quantity</th>
            <th>Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((row, i) => (
            <tr key={i}>
                <td>{row.name}</td>
                <td>{row.purchase_date ? new Date(row.purchase_date).toLocaleDateString() : 'N/A'}</td>
                <td>{new Date(row.sold_at).toLocaleDateString()}</td>
                <td>${Number(row.purchased_price || 0).toFixed(2)}</td>
                <td>${Number(row.sold_price || 0).toFixed(2)}</td>
                <td>{row.quantity}</td>
                <td>${(Number(row.sold_price) * row.quantity - ((row.purchased_price) * row.quantity)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
