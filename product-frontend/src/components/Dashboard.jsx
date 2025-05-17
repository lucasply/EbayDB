import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [totals, setTotals] = useState({
    total_stock_value: 0,
    total_sold_value: 0,
    revenue: 0,
  });

  useEffect(() => {
    api.get('/totals').then(res => setTotals(res.data));
  }, []);

  return (
    <div>
      <h2>📊 Dashboard</h2>

      <p>
        <strong>Total Stock Value:</strong> $
        {totals.total_stock_value != null
          ? Number(totals.total_stock_value).toFixed(2)
          : '0.00'}
      </p>

      <p>
        <strong>Total Sold Value:</strong> $
        {totals.total_sold_value != null
          ? Number(totals.total_sold_value).toFixed(2)
          : '0.00'}
      </p>

      <p>
        <strong>Revenue:</strong> $
        {totals.revenue != null
          ? Number(totals.revenue).toFixed(2)
          : '0.00'}
      </p>
    </div>
  );
}
