const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET: Fetch item by barcode
router.get('/by-barcode/:barcode', async (req, res) => {
  const { barcode } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM items WHERE barcode = ?', [barcode]);
    if (rows.length === 0) return res.status(404).json({ message: 'Item not found' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST: Insert scanned items into the items table
router.post('/add-scanned', async (req, res) => {
  const items = req.body.items;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }

  try {
    const insertPromises = items.map(item => {
      const product_id = uuidv4();
      return db.query(
        `INSERT INTO items (product_id, name, category, stock, selling_price, location, supplier, batch_number, expiry_date, barcode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product_id,
          item.name,
          item.category,
          item.stock || 0,
          item.selling_price,
          item.location || '',
          item.supplier || '',
          item.batch_number || '',
          item.expiry_date || null,
          item.barcode
        ]
      );
    });

    await Promise.all(insertPromises);
    return res.json({ message: 'Items inserted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Insertion failed', details: err.message });
  }
});

module.exports = router;
