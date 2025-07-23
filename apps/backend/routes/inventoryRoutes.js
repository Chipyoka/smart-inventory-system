const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');

// GET /api/inventory/summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const [[totalItems]] = await db.query(`SELECT COUNT(*) AS totalItems FROM items`);
    const [[newlyStocked]] = await db.query(`
      SELECT COUNT(*) AS newlyStocked FROM items
      WHERE created_at >= CURDATE() - INTERVAL 7 DAY
    `);
    const [[expired]] = await db.query(`
      SELECT COUNT(*) AS expired FROM items
      WHERE expiry_date IS NOT NULL AND expiry_date < CURDATE()
    `);
    const [[outOfStock]] = await db.query(`
      SELECT COUNT(*) AS outOfStock FROM items
      WHERE stock = 0
    `);

    res.json({
      totalItems: totalItems.totalItems,
      newlyStocked: newlyStocked.newlyStocked,
      expired: expired.expired,
      outOfStock: outOfStock.outOfStock,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/scan/:barcode
router.get('/scan/:barcode', authenticateToken, async (req, res) => {
  const { barcode } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT id, name, selling_price FROM items WHERE barcode = ?',
      [barcode]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error during barcode scan lookup:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
