const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.bulkInsertItems = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No items to insert' });
  }

  const values = items.map(item => [
    item.product_id,
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

  const sql = `
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
    await db.query(sql, [values]);
    res.json({ message: 'Items inserted or updated successfully.' });
  } catch (error) {
    console.error('Bulk insert error:', error);
    res.status(500).json({ message: 'Database insert failed' });
  }
};

// This controller handles inventory operations such as getting the list of items and adding new items.
// It interacts with the database to perform these operations and returns appropriate responses.