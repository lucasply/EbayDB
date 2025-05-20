import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Dashboard({ totals }) {

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
