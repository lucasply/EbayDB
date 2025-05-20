import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AddProductForm from './components/AddProductForm';
import StockManager from './components/StockManager';
import SaleRecorder from './components/SalesRecorder';
import ProductList from './components/ProductList';
import SoldList from './components/SoldList';

import { api } from './api';

export default function App() {
  const [totals, setTotals] = useState({
    total_stock_value: 0,
    total_sold_value: 0,
    revenue: 0,
  });

  const [products, setProducts] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [salesRefreshKey, setSalesRefreshKey] = useState(0);

  const refreshTotals = () => {
    api.get('/totals')
      .then(res => setTotals(res.data))
      .catch(err => console.error('Error fetching totals:', err));
  };

  const refreshProducts = () => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Error fetching products:', err));
  };

  const refreshStock = () => {
  api.get('/stock')
    .then(res => setStockData(res.data))
    .catch(err => console.error('Error fetching stock data:', err));
};

  const refreshSales = () => setSalesRefreshKey(prev => prev + 1);

  useEffect(() => {
    refreshTotals();
    refreshProducts();
    refreshStock();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Product Tracker</h1>
      <Dashboard totals={totals} />
      <AddProductForm onChange={() => {
        refreshTotals();
        refreshProducts(); // refresh product list
      }} />
      <StockManager
        products={products}
        onChange={() => {
          refreshTotals();
          refreshStock(); // update stock
        }}/>
      <SaleRecorder 
        products={products} 
        onChange={() => {
          refreshTotals();
          refreshProducts(); // refresh product list
          refreshStock(); // update stock
          refreshSales(); // 👈 trigger re-render of SoldList

        }} />
      <ProductList stockData={stockData} onChange={() => {
        refreshStock();
        refreshTotals();
        refreshProducts();
        }} />

      <SoldList refreshKey={salesRefreshKey} />

    </div>
  );
}

