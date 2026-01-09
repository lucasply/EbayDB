const express = require('express');
const router = express.Router();
const db = require('../db');

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
    `);

    // Paged data
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.company,
        p.price,
        p.upc,
        p.quantity,
        p.bought_at,
        (p.quantity * p.price) AS stock_value
      FROM products p
      ORDER BY p.name 
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({ data: rows, total });
  } catch (err) {
    console.error('Error fetching paginated stock:', err);
    res.status(500).json({ error: 'Failed to fetch paginated stock' });
  }
});

// Shows all products
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM products ORDER BY name');
  res.json(rows);
});

// Inserts a new product
router.post('/', async (req, res) => {
  const { name, price, company, quantity, date, upc } = req.body;
  const [result] = await db.query(
    'INSERT INTO products (name, price, company,  quantity, bought_at, upc) VALUES (?, ?, ?,  ?, ?, ?)',
    [name, price, company, quantity, date, upc]
  );
  res.json({ id: result.insertId });
});

// Deletes a product by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete product from products table
    await db.query('DELETE FROM products WHERE id = ?', [id]);


    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, error: 'Failed to delete product.' });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, company, price, quantity, date, upc } = req.body;

  try {
    await db.query(
      'UPDATE products SET name = ?, price = ?, company = ?, quantity = ?, bought_at = ?, upc = ? WHERE id = ?',
      [name, price, company, quantity, date, upc, id]
    );
    res.json({ success: true, message: 'Product updated.' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, error: 'Failed to update product.' });
  }
});




module.exports = router;
