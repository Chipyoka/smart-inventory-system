const db = require('../config/db');

exports.getInventory = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM inventory');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addItem = async (req, res) => {
  const { name, barcode, quantity } = req.body;
  try {
    await db.query('INSERT INTO inventory (name, barcode, quantity) VALUES (?, ?, ?)', [name, barcode, quantity]);
    res.status(201).json({ message: 'Item added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// This controller handles inventory operations such as getting the list of items and adding new items.
// It interacts with the database to perform these operations and returns appropriate responses.