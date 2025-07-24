const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { product_id, quantity, sold_price, revenue, date } = req.body;

  // Check current stock
  const [[stockRow]] = await db.query('SELECT quantity FROM stock WHERE product_id = ?', [product_id]);

  if (!stockRow || stockRow.quantity < quantity) {
    return res.json({
      success: false,
      message: `Insufficient stock. Available: ${stockRow ? stockRow.quantity : 0}, Requested: ${quantity}`
    });
  }
  if (stockRow.quantity - quantity === 0) {
    await db.query('UPDATE products SET upc = NULL WHERE id = ?', [product_id]);
  }
  // Deduct from stock
  await db.query('UPDATE stock SET quantity = quantity - ? WHERE product_id = ?', [quantity, product_id]);


  // Record sale
  await db.query(
    'INSERT INTO sold (product_id, quantity, sold_price, revenue, sold_at) VALUES (?, ?, ?, ?, ?)',
    [product_id, quantity, sold_price, revenue, date]
  );

  

  res.json({ success: true});
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
      s.id,         
      s.product_id,       
      p.name,
      p.company,
      s.sold_at,
      s.sold_price,
      s.revenue,
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

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM sold WHERE id = ?', [id]);
    res.status(200).json({ success: true });  
  } catch (err) {
    console.error('Error deleting sale:', err);
    res.status(500).json({ success: false, error: 'Failed to delete sale.' });
  }
});


router.post('/set', async (req, res) => {
  const { id, quantity, sold_price, revenue, date } = req.body;

  try {
      await db.query(
        'UPDATE sold SET quantity = ?, sold_price = ?, sold_at = ?, revenue = ? WHERE id = ?',
        [quantity, sold_price, date, revenue, id]
      );
      res.json({ success: true, message: 'Sale updated.' });
    } catch (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ success: false, error: 'Failed to update product.' });
    }
});


router.get('/paginated', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM sold');

    const [rows] = await db.query(`
      SELECT
        s.id,
        s.product_id,
        p.name,
        p.company,
        s.sold_at,
        s.sold_price,
        s.quantity,
        s.revenue,
        p.price AS purchased_price,
        stk.bought_at AS purchase_date
      FROM sold s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN stock stk ON s.product_id = stk.product_id
      ORDER BY p.name
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({ data: rows, total });
  } catch (err) {
    console.error('Error fetching paginated sales:', err);
    res.status(500).json({ error: 'Failed to fetch paginated sales' });
  }
});

module.exports = router;
