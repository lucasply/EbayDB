const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM totals WHERE id = 1');
  res.json(rows[0] || { total_stock_value: 0, total_sold_value: 0, revenue: 0 });
});


module.exports = router;
