import React, { useState, useEffect } from 'react';
import AddProductForm from './components/AddProductForm';
import StockManager from './components/StockManager';
import SaleRecorder from './components/SalesRecorder';
import ProductList from './components/ProductList';
import SoldList from './components/SoldList';
// import './app.css';

import { api } from './api';

export default function App() {
  const [totals, setTotals] = useState({
    total_stock_value: 0,
    total_sold_value: 0,
    revenue: 0,
  });

  const [products, setProducts] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [sales, setSales] = useState([]);


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


  const refreshSales = () => {
    api.get('/sold/history')
      .then(res =>{ 
        setSales(res.data)
      })
      .catch(err => console.error('Failed to fetch sales history:', err));
  };

  useEffect(() => {
    refreshTotals();
    refreshProducts();
    refreshStock();
    refreshSales();
  }, []);

  return (
    <div className="body">
      <h1>Product Tracker</h1>
      <AddProductForm onChange={() => {
        refreshTotals();
        refreshProducts();
      }} />
      <StockManager
        products={products}
        onChange={() => {
          refreshTotals();
          refreshStock();
        }}
      />
      <SaleRecorder 
        products={products} 
        onChange={() => {
          refreshProducts();
          refreshStock();
          refreshSales();
        }} 
      />

        <div className="flex-row">
          <div className="flex-column">
            <ProductList stockData={stockData} onChange={() => {
              refreshStock();
              refreshProducts();
              refreshSales();

            }} />
          </div>

        <div className="flex-column soldlist-column">
          <SoldList sales={sales} onChange={() => {
              refreshSales();
              refreshStock();
              refreshProducts();
            }}
          />
        </div>
      </div>
    </div>
  );

}

