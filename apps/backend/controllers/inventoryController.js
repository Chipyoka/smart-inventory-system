const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Helper: Insert audit logs
const insertAuditLogs = async (logs) => {
  if (!logs.length) return;

  const sqlInsertAuditLogs = `
    INSERT INTO audit_logs (
      user_id,
      action_type,
      product_id,
      name,
      barcode,
      stock,
      location,
      action_time
    ) VALUES ?
  `;
  await db.query(sqlInsertAuditLogs, [logs]);
};

exports.getStockedProducts = async (req, res) => {
  try {
    const sql = `
      SELECT 
        i.product_id,
        i.name,
        i.barcode,
        i.stock,
        i.quality,
        i.location,
        i.expiry_date,
        i.batch_number,
        i.selling_price,
        c.name AS category_name,
        s.name AS supplier_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.category_id
      LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
      WHERE i.stock > 0
      ORDER BY i.name ASC
    `;
    const [rows] = await db.query(sql);
    res.status(200).json(rows);
  } catch (error) {
    console.error('getStockedProducts error:', error);
    res.status(500).json({ message: 'Failed to fetch stocked products' });
  }
};


// GET /summary
exports.getInventorySummary = async (req, res) => {
  try {
    const sql = `
      SELECT
        COUNT(*) AS total_items,
        SUM(stock) AS total_stock,
        (
          SELECT COUNT(*) 
          FROM items 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ) AS newly_stocked,
        (
          SELECT COUNT(*) 
          FROM items 
          WHERE expiry_date IS NOT NULL AND expiry_date < CURDATE()
        ) AS expired,
        (
          SELECT COUNT(*) 
          FROM items 
          WHERE stock = 0
        ) AS out_of_stock
      FROM items
    `;
    const [rows] = await db.query(sql);
    res.status(200).json({
      totalItems: rows[0].total_items,
      totalStock: rows[0].total_stock || 0,
      newlyStocked: rows[0].newly_stocked,
      expired: rows[0].expired,
      outOfStock: rows[0].out_of_stock,
    });
  } catch (error) {
    console.error('getInventorySummary error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory summary' });
  }
};



// GET /scan/:barcode
exports.scanBarcode = async (req, res) => {
  const { barcode } = req.params;
  try {
    const sql = 'SELECT * FROM items WHERE barcode = ? LIMIT 1';
    const [rows] = await db.query(sql, [barcode]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Barcode not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('scanBarcode error:', error);
    res.status(500).json({ message: 'Failed to scan barcode' });
  }
};

// GET /by-barcode/:barcode
exports.getItemByBarcode = async (req, res) => {
  const { barcode } = req.params;
  console.log("Received barcode:", barcode);  // <-- Debug log

  try {
    const sql = "SELECT * FROM items WHERE barcode = ? LIMIT 1";
    const [rows] = await db.query(sql, [barcode]);

    console.log("DB query result:", rows); // <-- Debug log

    if (rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("getItemByBarcode error:", error);
    res.status(500).json({ message: "Failed to get item by barcode" });
  }
};

// POST /bulk-insert
exports.bulkInsertItems = async (req, res) => {
  const { items } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No items to insert' });
  }

  const values = items.map(item => [
    item.product_id || uuidv4(),
    item.name,
    item.barcode,
    item.category_id,
    item.supplier_id,
    item.selling_price,
    item.quantity,
    item.quality,
    item.location,
    item.batch_number,
    item.expiry_date
  ]);

  const sqlInsertItems = `
    INSERT INTO items (
      product_id,
      name,
      barcode,
      category_id,
      supplier_id,
      selling_price,
      stock,
      quality,
      location,
      batch_number,
      expiry_date
    ) VALUES ?
    ON DUPLICATE KEY UPDATE 
      name = VALUES(name),
      category_id = VALUES(category_id),
      supplier_id = VALUES(supplier_id),
      selling_price = VALUES(selling_price),
      stock = stock + VALUES(stock),
      quality = VALUES(quality),
      location = VALUES(location),
      batch_number = VALUES(batch_number),
      expiry_date = VALUES(expiry_date)
  `;

  try {
    await db.query(sqlInsertItems, [values]);

    // Prepare audit logs for inserted/updated items
    const auditLogs = values.map(value => [
      userId,
      'INSERT/UPDATE',
      value[0],    // product_id
      value[1],    // name
      value[2],    // barcode
      value[6],    // stock/quantity
      value[8],    // location
      new Date()
    ]);

    await insertAuditLogs(auditLogs);

    res.status(200).json({
      message: 'Items inserted/updated successfully',
      inserted: values.length,
      audited: auditLogs.length
    });
  } catch (error) {
    console.error('bulkInsertItems error:', error);
    res.status(500).json({ message: 'Failed to insert items' });
  }
};

// POST /bulk-delete
exports.bulkDeleteItems = async (req, res) => {
  const { product_ids } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(product_ids) || product_ids.length === 0) {
    return res.status(400).json({ message: 'No product IDs provided for deletion' });
  }

  try {
    // Fetch items for audit logging before deletion
    const placeholders = product_ids.map(() => '?').join(',');
    const sqlSelectItems = `SELECT * FROM items WHERE product_id IN (${placeholders})`;
    const [itemsToDelete] = await db.query(sqlSelectItems, product_ids);

    if (!itemsToDelete.length) {
      return res.status(404).json({ message: 'No matching items found to delete' });
    }

    // Delete items
    const sqlDelete = `DELETE FROM items WHERE product_id IN (${placeholders})`;
    await db.query(sqlDelete, product_ids);

    // Prepare audit logs
    const auditLogs = itemsToDelete.map(item => [
      userId,
      'DELETE',
      item.product_id,
      item.name,
      item.barcode,
      item.stock,
      item.location,
      new Date()
    ]);

    await insertAuditLogs(auditLogs);

    res.status(200).json({
      message: `Deleted ${itemsToDelete.length} item(s) successfully`,
      deleted: itemsToDelete.length,
      audited: auditLogs.length
    });
  } catch (error) {
    console.error('bulkDeleteItems error:', error);
    res.status(500).json({ message: 'Failed to delete items' });
  }
};
