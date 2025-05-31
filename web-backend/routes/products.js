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
  const { name, price, company, upc } = req.body;
  const [result] = await db.query(
    'INSERT INTO products (name, price, company,  upc) VALUES (?, ?, ?,  ?)',
    [name, price, company, upc]
  );
  res.json({ id: result.insertId });
});

// Deletes a product by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete product from products table
    await db.query('DELETE FROM products WHERE id = ?', [id]);

    // Delete related stock/sold entries
    await db.query('DELETE FROM stock WHERE product_id = ?', [id]);
    await db.query('DELETE FROM sold WHERE product_id = ?', [id]);

    // Recalculate total stock value
    const [stockValueRows] = await db.query(`
      SELECT IFNULL(SUM(s.quantity * p.price), 0) AS total_stock_value
      FROM stock s
      JOIN products p ON s.product_id = p.id
    `);

    const total_stock_value = stockValueRows[0].total_stock_value;

    await db.query(`
      INSERT INTO totals (id, total_stock_value)
      VALUES (1, ?)
      ON DUPLICATE KEY UPDATE total_stock_value = VALUES(total_stock_value)
    `, [total_stock_value]);

    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, error: 'Failed to delete product.' });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, company, upc } = req.body;

  try {
    await db.query(
      'UPDATE products SET name = ?, price = ?, company = ?, upc = ? WHERE id = ?',
      [name, price, company, upc, id]
    );
    res.json({ success: true, message: 'Product updated.' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, error: 'Failed to update product.' });
  }
});

// Get paginated stock list with joined product info
router.get('/paginated', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  // console.log(`Fetching page ${page} with limit ${limit} and offset ${offset}`);
  try {
    // Total count
    const [[{ total }]] = await db.query(`
      SELECT COUNT(*) AS total FROM products
      JOIN stock ON products.id = stock.product_id
    `);

    // Paged data
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.company,
        p.price,
        p.upc,
        s.quantity,
        s.bought_at,
        (s.quantity * p.price) AS stock_value
      FROM products p
      JOIN stock s ON p.id = s.product_id
      ORDER BY s.bought_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({ data: rows, total });
  } catch (err) {
    console.error('Error fetching paginated stock:', err);
    res.status(500).json({ error: 'Failed to fetch paginated stock' });
  }
});


module.exports = router;
