import React, { useState, useEffect } from 'react';
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


  const refreshTotals = () => {
    api.get('/totals')
      .then(res => setTotals(res.data))
      .catch(err => console.error('Error fetching totals:', err));
  };

  const [productPage, setProductPage] = useState(1);

  const refreshFullProducts = () => {
    api.get('/products')  
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  };

  const [paginatedProducts, setPaginatedProducts] = useState({ data: [], page: 1, total: 0 });
  const refreshPaginatedProducts = (page = 1) => {
    api.get(`/products/paginated?page=${page}&limit=10`)
      .then(res => setPaginatedProducts(res.data))
      .catch(err => console.error(err));
  };

  const refreshStock = () => {
  api.get('/stock')
    .then(res => setStockData(res.data))
    .catch(err => console.error('Error fetching stock data:', err));
};


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
    refreshTotals();
    refreshPaginatedProducts(productPage);
    refreshStock();
    refreshSales(salesPage);
    refreshFullProducts();
  }, []);

  return (
    <div className="body">
      <h1>Product Tracker</h1>
      <AddProductForm onChange={() => {
        refreshFullProducts();
      }} />
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
          refreshSales();
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
                refreshSales(newPage);

              }}
              onChange={() => {
                refreshPaginatedProducts(productPage);
                refreshStock();
                refreshSales(salesPage);
              }}
            />
          </div>

        <div className="flex-column soldlist-column">
          <SoldList
            sales={sales}
            currentPage={salesPage}
            totalItems={totalSales}
            onPageChange={(newPage) => {
              setSalesPage(newPage);
              refreshSales(newPage);
              refreshPaginatedProducts(newPage);
            }}
            onChange={() => {
              refreshSales(salesPage);
              refreshPaginatedProducts(productPage);
              refreshStock();
            }}
          />
        </div>
      </div>
    </div>
  );

}

