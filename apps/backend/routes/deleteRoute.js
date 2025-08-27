const express = require('express');
const router = express.Router();
const pool = require('../db'); // mysql2 pool connection
const { v4: uuidv4 } = require('uuid');

// Middleware to check authenticated user
const authenticate = (req, res, next) => {
  if (!req.user || !req.user.id) return res.status(401).json({ message: 'Unauthorized' });
  next();
};

// POST /api/items/delete
router.post('/delete', authenticate, async (req, res) => {
  const { barcodes } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(barcodes) || barcodes.length === 0) {
    return res.status(400).json({ message: 'No barcodes provided' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch items to delete
    const [items] = await connection.query(
      `SELECT * FROM items WHERE barcode IN (?)`,
      [barcodes]
    );

    if (items.length === 0) {
      await connection.release();
      return res.status(404).json({ message: 'No items found with provided barcodes' });
    }

    // Delete items
    const [deleteResult] = await connection.query(
      `DELETE FROM items WHERE barcode IN (?)`,
      [barcodes]
    );

    // Insert audit logs
    const auditValues = items.map(item => [
      userId,
      'delete',
      item.product_id,
      item.name,
      item.barcode,
      item.stock,
      item.location,
      new Date()
    ]);

    await connection.query(
      `INSERT INTO audit_logs (user_id, action_type, product_id, name, barcode, stock, location, action_timestamp) VALUES ?`,
      [auditValues]
    );

    await connection.commit();
    res.json({ message: `Deleted ${deleteResult.affectedRows} items successfully`, deletedItems: items });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting items' });
  } finally {
    connection.release();
  }
});

module.exports = router;
