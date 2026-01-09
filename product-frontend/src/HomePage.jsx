import React, { useState, useEffect } from 'react';
import AddProductForm from './components/AddProductForm';
import SaleRecorder from './components/SalesRecorder';
import ProductList from './components/ProductList';
import { api } from './api';

export default function HomePage() {
  const [totals, setTotals] = useState({ total_stock_value: 0, total_sold_value: 0, revenue: 0 });
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState({ data: [], page: 1, total: 0 });
  const [highlightedProductId, setHighlightedProductId] = useState(null);

  const refreshTotals = () => {
    api.get('/totals').then(res => setTotals(res.data)).catch(console.error);
  };

  const refreshPaginatedProducts = (page = 1) => {
    api.get(`/products/paginated?page=${page}&limit=10`)
      .then(res => setPaginatedProducts(res.data))
      .catch(console.error);
  };


  const refreshFullProducts = () => {
    api.get('/products').then(res => setProducts(res.data)).catch(console.error);
  };

  useEffect(() => {
    refreshTotals();
    refreshPaginatedProducts(productPage);
    refreshFullProducts();
  }, []);

  return (
    <div className="body">
      <h1>Product Tracker</h1>
    
      <AddProductForm
        onChange={refreshFullProducts}                  // refresh products
        refreshPaginatedProducts={refreshPaginatedProducts} // allow child to fetch page
        setProductPage={setProductPage}                // handle page change
        setHighlightedProductId={setHighlightedProductId} // handle highlight
      />


      

      <SaleRecorder
        products={products}
        onChange={() => {
          refreshPaginatedProducts(productPage);
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
              refreshFullProducts();           // for SaleRecorder dropdown
            }}
            highlightedProductId={highlightedProductId}
          />
        </div>
      </div>
    </div>
  );
}
