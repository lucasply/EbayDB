const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { product_id, quantity, sold_price, date } = req.body;

  // Check current stock
  const [[stockRow]] = await db.query('SELECT quantity FROM stock WHERE product_id = ?', [product_id]);

  if (!stockRow || stockRow.quantity < quantity) {
    return res.json({
      success: false,
      message: `Insufficient stock. Available: ${stockRow ? stockRow.quantity : 0}, Requested: ${quantity}`
    });
  }
  
  // Deduct from stock
  await db.query('UPDATE stock SET quantity = quantity - ? WHERE product_id = ?', [quantity, product_id]);

  // Record sale
  await db.query(
    'INSERT INTO sold (product_id, quantity, sold_price, sold_at) VALUES (?, ?, ?, ?)',
    [product_id, quantity, sold_price, date]
  );

  // Recalculate total stock value
  const [stockValueRows] = await db.query(`
    SELECT IFNULL(SUM(s.quantity * p.price), 0) AS total_stock_value
    FROM stock s
    JOIN products p ON s.product_id = p.id
  `);
  const total_stock_value = stockValueRows[0].total_stock_value;

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
    `UPDATE totals
    SET revenue = IFNULL(revenue, 0) + ?,
        total_sold_value = ?,
        total_stock_value = ?
    WHERE id = 1`,
    [revenue, total_sold_value, total_stock_value]
  );
  } else {
    await db.query(
      'INSERT INTO totals(id, revenue, total_sold_value, total_stock_value) VALUES (1, ?, ?, ?)',
      [revenue, total_sold_value, total_stock_value]
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

router.get('/history', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.name,
        s.sold_at,
        s.sold_price,
        s.quantity,
        p.price AS purchased_price,
        stk.bought_at AS purchase_date
      FROM sold s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN stock stk ON s.product_id = stk.product_id
      ORDER BY s.sold_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching sales history:', err);
    res.status(500).json({ error: 'Failed to fetch sales history' });
  }
});



module.exports = router;
