const express = require('express');
const router = express.Router();
const db = require('../config/db');
const inventoryController = require('../controllers/inventoryController');
const { verifyToken } = require('../middleware/authMiddleware'); 
const checkRole = require('../middleware/roleMiddleware'); 

//Inventory Summary - Secured Route
router.get('/summary', verifyToken, async (req, res) => {
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

//Barcode Scan - Secured Route
router.get('/scan/:barcode', verifyToken, async (req, res) => {
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

router.post('/bulk-insert', verifyToken, checkRole('admin', 'manager'), inventoryController.bulkInsertItems);

module.exports = router;
