import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function ProductList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/stock').then(res => setData(res.data));
  }, []);

  return (
    <div>
      <h2>📦 Product Inventory</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.quantity}</td>
              <td>${row.price}</td>
              <td>${row.stock_value ? Number(row.stock_value).toFixed(2) : '0.00'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
