import React, { useState, useEffect } from 'react';
import AddProductForm from './components/AddProductForm';
import StockManager from './components/StockManager';
import SaleRecorder from './components/SalesRecorder';
import ProductList from './components/ProductList';
import { api } from './api';

export default function HomePage() {
  const [totals, setTotals] = useState({ total_stock_value: 0, total_sold_value: 0, revenue: 0 });
  const [products, setProducts] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState({ data: [], page: 1, total: 0 });

  const refreshTotals = () => {
    api.get('/totals').then(res => setTotals(res.data)).catch(console.error);
  };

  const refreshPaginatedProducts = (page = 1) => {
    api.get(`/products/paginated?page=${page}&limit=10`)
      .then(res => setPaginatedProducts(res.data))
      .catch(console.error);
  };

  const refreshStock = () => {
    api.get('/stock').then(res => setStockData(res.data)).catch(console.error);
  };

  const refreshFullProducts = () => {
    api.get('/products').then(res => setProducts(res.data)).catch(console.error);
  };

  useEffect(() => {
    refreshTotals();
    refreshPaginatedProducts(productPage);
    refreshStock();
    refreshFullProducts();
  }, []);

  return (
    <div className="body">
      <h1>Product Tracker</h1>

      <AddProductForm onChange={refreshFullProducts} />

      <StockManager
        products={products}
        onChange={() => {
          refreshPaginatedProducts(productPage);
          refreshTotals();
          refreshStock();
        }}
      />

      <SaleRecorder
        products={products}
        onChange={() => {
          refreshPaginatedProducts(productPage);
          refreshStock();
        }}
      />

      <div className="flex-row">
        <div className="flex-column">
          <ProductList
            stockData={paginatedProducts.data}
            currentPage={productPage}
            totalItems={paginatedProducts.total}
            onPageChange={(newPage) => {
              setProductPage(newPage);
              refreshPaginatedProducts(newPage);
            }}
            onChange={() => {
              refreshPaginatedProducts(productPage);
              refreshStock();
            }}
          />
        </div>
      </div>
    </div>
  );
}
