const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// GET /api/items/most-in-demand
router.get("/most-in-demand", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT name, selling_price, stock, barcode
      FROM items
      WHERE stock > 0
      ORDER BY stock DESC
      LIMIT 10
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching most-in-demand items:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/items/notifications
router.get("/notifications", verifyToken, async (req, res) => {
  try {
    const [lowStockItems] = await db.query(`
      SELECT name, stock, expiry_date, barcode
      FROM items
      WHERE stock <= 20
      ORDER BY stock ASC
      LIMIT 10
    `);

    const [expiredItems] = await db.query(`
      SELECT name, stock, expiry_date, barcode
      FROM items
      WHERE expiry_date IS NOT NULL AND expiry_date < CURDATE()
      ORDER BY expiry_date ASC
      LIMIT 10
    `);

    const notifications = [];

    lowStockItems.forEach((item) => {
      notifications.push({
        message: `Low stock: ${item.name} (Stock: ${item.stock})`,
        type: "low_stock",
        time: item.expiry_date,
        barcode: item.barcode,
      });
    });

    expiredItems.forEach((item) => {
      notifications.push({
        message: `Expired: ${item.name} (Expiry: ${item.expiry_date.toISOString().split("T")[0]})`,
        type: "expired",
        time: item.expiry_date,
        barcode: item.barcode,
      });
    });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
