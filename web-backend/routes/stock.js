const express = require('express');
const router = express.Router();
const db = require('../db');

// Shows stock information
router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.id, p.name, s.quantity, p.price, (s.quantity * p.price) AS stock_value
    FROM stock s
    JOIN products p ON s.product_id = p.id
  `);
  res.json(rows);
});

// Updates stock information and updates totals table
router.post('/update', async (req, res) => {
  const { product_id, quantity } = req.body;

  // Check if entry exists
  const [rows] = await db.query('SELECT * FROM stock WHERE product_id = ?', [product_id]);

  if (rows.length > 0) {
    await db.query('UPDATE stock SET quantity = quantity + ? WHERE product_id = ?', [quantity, product_id]);
  } else {
    await db.query('INSERT INTO stock (product_id, quantity) VALUES (?, ?)', [product_id, quantity]);
  }

  // Calculate the new total stock value
  const [totalRows] = await db.query(`
    SELECT IFNULL(SUM(s.quantity * p.price), 0) AS total_stock_value
    FROM stock s
    JOIN products p ON s.product_id = p.id
  `);

  const total_stock_value = totalRows[0].total_stock_value;

  // Update totals table (assuming id=1 is the single row)
  await db.query(`
    INSERT INTO totals (id, total_stock_value) VALUES (1, ?)
    ON DUPLICATE KEY UPDATE total_stock_value = VALUES(total_stock_value)
  `, [total_stock_value]);

  res.json({ success: true, total_stock_value });
});

module.exports = router;
