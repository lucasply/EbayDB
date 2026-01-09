require('dotenv').config();

const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();

// Middleware
app.use(express.json());

// Routes
const productRoutes = require('./routes/products');
const soldRoutes = require('./routes/sold');
const totalsRoutes = require('./routes/totals');

// API routes
app.use('/api/products', productRoutes);
app.use('/api/sold', soldRoutes);
app.use('/api/totals', totalsRoutes);


if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../product-frontend/dist');

  app.use(express.static(distPath));

  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

}

// MySQL pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'webdb',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool.promise();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
