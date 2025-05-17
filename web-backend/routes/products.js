const express = require('express');
const router = express.Router();
const db = require('../db');

// Shows all products
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM products');
  res.json(rows);
});

// Inserts a new product
router.post('/', async (req, res) => {
  const { name, price, description, upc } = req.body;
  const [result] = await db.query(
    'INSERT INTO products (name, price, description, upc) VALUES (?, ?, ?, ?)',
    [name, price, description, upc]
  );
  res.json({ id: result.insertId });
});

module.exports = router;
