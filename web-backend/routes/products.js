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

// Deletes a product by ID
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
  const { name, price, description, upc } = req.body;

  try {
    await db.query(
      'UPDATE products SET name = ?, price = ?, description = ?, upc = ? WHERE id = ?',
      [name, price, description, upc, id]
    );
    res.json({ success: true, message: 'Product updated.' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, error: 'Failed to update product.' });
  }
});


module.exports = router;
