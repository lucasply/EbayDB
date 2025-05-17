import React from 'react';
import Dashboard from './components/Dashboard';
import AddProductForm from './components/AddProductForm';
import StockManager from './components/StockManager';
import SaleRecorder from './components/SalesRecorder';
import ProductList from './components/ProductList';

export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Product Tracker</h1>
      <Dashboard />
      <AddProductForm />
      <StockManager />
      <SaleRecorder />
      <ProductList />
    </div>
  );
}
