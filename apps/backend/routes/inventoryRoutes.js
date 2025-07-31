const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Rate limiter for insert/delete routes to prevent abuse
const inventoryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // limit each IP to 30 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again later.' },
});

// Inventory Summary
router.get('/summary', verifyToken, inventoryController.getInventorySummary);

// Real-time Barcode Scan
router.get('/scan/:barcode', verifyToken, inventoryController.scanBarcode);

// Get Item Details by Barcode
router.get('/by-barcode/:barcode', verifyToken, inventoryController.getItemByBarcode);

// Bulk Insert or Update Items (with Audit Logging)
router.post(
  '/bulk-insert',
  inventoryLimiter,
  verifyToken,
  checkRole('admin', 'manager'),
  inventoryController.bulkInsertItems
);

// Bulk Delete Items (with Audit Logging)
router.post(
  '/bulk-delete',
  inventoryLimiter,
  verifyToken,
  checkRole('admin', 'manager'),
  inventoryController.bulkDeleteItems
);

module.exports = router;
