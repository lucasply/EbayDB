import React, { useState, useEffect } from 'react';
import SoldList from './components/SoldList';
import { api } from './api';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [salesPage, setSalesPage] = useState(1);
  const [totalSales, setTotalSales] = useState(0);

  const refreshSales = (page = 1) => {
    api.get(`/sold/paginated?page=${page}&limit=10`)
      .then(res => {
        setSales(res.data.data);
        setTotalSales(res.data.total);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    refreshSales(salesPage);
  }, []);

  return (
    <div className="body">
      <h1>Sales</h1>
      <SoldList
        sales={sales}
        currentPage={salesPage}
        totalItems={totalSales}
        onPageChange={(newPage) => {
          setSalesPage(newPage);
          refreshSales(newPage);
        }}
        onChange={() => {
          refreshSales(salesPage);
        }}
      />
    </div>
  );
}
