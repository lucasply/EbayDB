const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { product_id, quantity, sold_price, revenue, date } = req.body;

  // Check current stock
  const [[stockRow]] = await db.query('SELECT quantity FROM products WHERE id = ?', [product_id]);

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
  await db.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [quantity, product_id]);


  // Record sale
  await db.query(
    'INSERT INTO sold (product_id, quantity, sold_price, revenue, sold_at) VALUES (?, ?, ?, ?, ?)',
    [product_id, quantity, sold_price, revenue, date]
  );

  // Update total revenue
  await db.query('UPDATE totals SET revenue = revenue + ? WHERE id = 1', [revenue]);

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
      t.revenue AS total_revenue,
      s.quantity,
      p.price AS purchased_price,
      p.bought_at AS purchase_date
    FROM sold s
    JOIN products p ON s.product_id = p.id
    CROSS JOIN totals t
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
  const [[saleToDelete]] = await db.query('SELECT revenue FROM sold WHERE id = ?', [id]);
  try {
    await db.query('DELETE FROM sold WHERE id = ?', [id]);
    await db.query('UPDATE totals SET revenue = revenue - ? WHERE id = 1', [saleToDelete.revenue]);
    res.status(200).json({ success: true });  
  } catch (err) {
    console.error('Error deleting sale:', err);
    res.status(500).json({ success: false, error: 'Failed to delete sale.' });
  }
});


router.post('/set', async (req, res) => {
  const { id, quantity, sold_price, revenue, date } = req.body;
  const [[existingSale]] = await db.query('SELECT revenue FROM sold WHERE id = ?', [id]);
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
    // Adjust the total revenue
    // Subtract old revenue, add new revenue
    const revenueDifference = revenue - existingSale.revenue;
    await db.query('UPDATE totals SET revenue = revenue + ? WHERE id = 1', [revenueDifference]);
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
        p.upc,
        s.sold_at,
        s.sold_price,
        s.quantity,
        s.revenue,
        p.price AS purchased_price,
        p.bought_at AS purchase_date
      FROM sold s
      JOIN products p ON s.product_id = p.id
      ORDER BY p.name
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({ data: rows, total });
  } catch (err) {
    console.error('Error fetching paginated sales:', err);
    res.status(500).json({ error: 'Failed to fetch paginated sales' });
  }
});


router.get('/daily/:year/:month', async (req, res) => {
  const { year, month } = req.params; // month = 1-12
  try {
    const [rows] = await db.query(`
      SELECT 
        DAY(s.sold_at) AS day,
        COALESCE(SUM(s.revenue), 0) AS total_revenue
    FROM sold s
    WHERE YEAR(s.sold_at) = ? AND MONTH(s.sold_at) = ?
    GROUP BY DAY(s.sold_at)
    ORDER BY DAY(s.sold_at)
    `, [year, month]);

    // Fill missing days with 0 sales
    const daysInMonth = new Date(year, month, 0).getDate();
    const salesByDay = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const found = rows.find(r => r.day === day);
      return { day, total_revenue: found ? Number(found.total_revenue) : 0 };
    });

    res.json(salesByDay);
  } catch (err) {
    console.error('Error fetching daily sales:', err);
    res.status(500).json({ error: 'Failed to fetch daily sales' });
  }
});


router.get('/yearly/:year', async (req, res) => {
  const { year } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT
        MONTH(s.sold_at) AS month,
        COALESCE(SUM(s.revenue), 0) AS total_revenue
      FROM sold s
      WHERE YEAR(s.sold_at) = ?
      GROUP BY MONTH(s.sold_at)
      ORDER BY MONTH(s.sold_at)
    `, [year]);

    // Ensure all 12 months exist (even if 0 revenue)
    const salesByMonth = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = rows.find(r => r.month === month);

      return {
        month,
        total_revenue: found ? Number(found.total_revenue) : 0
      };
    });

    res.json(salesByMonth);
  } catch (err) {
    console.error('Error fetching yearly sales:', err);
    res.status(500).json({ error: 'Failed to fetch yearly sales' });
  }
});


module.exports = router;
