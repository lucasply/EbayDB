require('dotenv').config();


const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();

// Middleware to parse JSON 
app.use(express.json());

// Import routes
const productRoutes = require('./routes/products');
const stockRoutes = require('./routes/stock');
const soldRoutes = require('./routes/sold');
const totalsRoutes = require('./routes/totals'); 

// Mount API routes
app.use('/products', productRoutes);
app.use('/stock', stockRoutes);
app.use('/sold', soldRoutes);
app.use('/totals', totalsRoutes); 

// Serve static frontend files 
app.use(express.static(path.join(__dirname, '../product-frontend/dist')));

// Catch-all route for frontend routing 
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../product-frontend/dist/index.html'));
});


// Connect to local MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'webdb',
  waitForConnections: true,
  connectionLimit: 10,
});
module.exports = pool.promise();

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
