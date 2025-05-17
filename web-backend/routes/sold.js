const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { product_id, quantity, sold_price } = req.body;

  // Deduct from stock
  await db.query('UPDATE stock SET quantity = quantity - ? WHERE product_id = ?', [quantity, product_id]);

  // Remove from stock if quantity is now 0
  await db.query('DELETE FROM stock WHERE product_id = ? AND quantity <= 0', [product_id]);

  // Record sale
  await db.query(
    'INSERT INTO sold (product_id, quantity, sold_price) VALUES (?, ?, ?)',
    [product_id, quantity, sold_price]
  );

  // Recalculate total sold value
  const [totalRows] = await db.query(`
    SELECT IFNULL(SUM(quantity * sold_price), 0) AS total_sold_value
    FROM sold
  `);

  const total_sold_value = totalRows[0].total_sold_value;

  // Get the original price of the product
  const [[product]] = await db.query('SELECT price FROM products WHERE id = ?', [product_id]);
  const gross = quantity * sold_price;
  const cost = quantity * product.price;
  const revenue = gross - cost;

  // Check if totals row exists
  const [totals] = await db.query('SELECT * FROM totals WHERE id = 1');

  if (totals.length > 0) {
    await db.query(
      'UPDATE totals SET revenue = revenue + ?, total_sold_value = ? WHERE id = 1',
      [revenue, total_sold_value]
    );
  } else {
    await db.query(
      'INSERT INTO totals (id, revenue, total_sold_value, total_stock_value) VALUES (1, ?, ?, 0)',
      [revenue, total_sold_value]
    );
  }

  res.json({ success: true, total_sold_value, revenue });
});


router.get('/top', async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.name, SUM(s.quantity) AS total_sold
    FROM sold s
    JOIN products p ON s.product_id = p.id
    GROUP BY s.product_id
    ORDER BY total_sold DESC
  `);
  res.json(rows);
});

module.exports = router;
