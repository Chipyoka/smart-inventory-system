const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1) Inventory Value by Category
router.get('/inventory-value-by-category', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        COALESCE(c.name, 'Uncategorized') AS category,
        ROUND(SUM(i.selling_price * i.stock), 2) AS value,
        SUM(i.stock) AS units
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.category_id
      GROUP BY COALESCE(c.name, 'Uncategorized')
      ORDER BY value DESC;
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Error computing inventory value', error: e.message });
  }
});

// 2) Expiry Risk Buckets
router.get('/expiry-risk-buckets', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT bucket, COUNT(*) AS count FROM (
        SELECT
          CASE
            WHEN i.expiry_date IS NULL THEN 'No expiry'
            WHEN i.expiry_date < CURDATE() THEN 'Expired'
            WHEN i.expiry_date <= CURDATE() + INTERVAL 30 DAY THEN '≤30 days'
            WHEN i.expiry_date <= CURDATE() + INTERVAL 60 DAY THEN '31–60 days'
            WHEN i.expiry_date <= CURDATE() + INTERVAL 90 DAY THEN '61–90 days'
            ELSE '>90 days'
          END AS bucket
        FROM items i
      ) t
      GROUP BY bucket
      ORDER BY
        FIELD(bucket, 'Expired','≤30 days','31–60 days','61–90 days','>90 days','No expiry');
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Error computing expiry buckets', error: e.message });
  }
});

// 3) Stock Status by Category (threshold query param, default 20)
router.get('/stock-status-by-category', async (req, res) => {
  const threshold = Number(req.query.threshold ?? 20);
  try {
    const [rows] = await db.execute(`
      SELECT 
        COALESCE(c.name, 'Uncategorized') AS category,
        SUM(CASE WHEN i.stock = 0 THEN 1 ELSE 0 END) AS out_of_stock,
        SUM(CASE WHEN i.stock > 0 AND i.stock <= ? THEN 1 ELSE 0 END) AS low_stock,
        SUM(CASE WHEN i.stock > ? THEN 1 ELSE 0 END) AS healthy
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.category_id
      GROUP BY COALESCE(c.name, 'Uncategorized')
      ORDER BY category;
    `, [threshold, threshold]);
    res.json({ threshold, data: rows });
  } catch (e) {
    res.status(500).json({ message: 'Error computing stock status', error: e.message });
  }
});

// 4) Audit Activity Trend (last 30 days)
router.get('/audit-activity-30d', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        DATE(a.action_timestamp) AS date,
        SUM(a.action_type = 'insert') AS inserts,
        SUM(a.action_type = 'update') AS updates,
        SUM(a.action_type = 'delete') AS deletes
      FROM audit_logs a
      WHERE a.action_timestamp >= CURDATE() - INTERVAL 29 DAY
      GROUP BY DATE(a.action_timestamp)
      ORDER BY DATE(a.action_timestamp);
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Error computing audit trend', error: e.message });
  }
});

module.exports = router;
