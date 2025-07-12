const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedInitialData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // 1. Seed Super Admin
  const [users] = await connection.query("SELECT * FROM users WHERE email = 'admin@sims.com'");
  if (users.length === 0) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await connection.query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Super Admin', 'admin@sims.com', hashedPassword, 'admin']
    );
    console.log('✅ Super Admin seeded.');
  }

  // 2. Seed Supplier
  const [suppliers] = await connection.query("SELECT * FROM suppliers WHERE name = 'Default Supplier'");
  if (suppliers.length === 0) {
    await connection.query(
      `INSERT INTO suppliers (name, contact, address, email) VALUES (?, ?, ?, ?)`,
      ['Default Supplier', '0977000000', 'Lusaka, Zambia', 'supplier@example.com']
    );
    console.log('✅ Sample Supplier seeded.');
  }

  // Get inserted supplier ID
  const [supplierRow] = await connection.query("SELECT id FROM suppliers WHERE name = 'Default Supplier'");
  const supplierId = supplierRow[0].id;

  // 3. Seed Inventory
  const [products] = await connection.query("SELECT * FROM inventory WHERE name = 'Sample Product'");
  if (products.length === 0) {
    await connection.query(
      `INSERT INTO inventory (name, category, stock, selling_price, location, supplier_id, batch_no, expiry_date, barcode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Sample Product', 'Drinks', 100, 49.99, 'Aisle 1', supplierId, 'BATCH001', '2025-12-31', '123456789012']
    );
    console.log('✅ Sample Inventory Product seeded.');
  }

  // 4. Seed Notification
  const [adminRow] = await connection.query("SELECT id FROM users WHERE email = 'admin@sims.com'");
  const adminId = adminRow[0].id;

  const [notifs] = await connection.query("SELECT * FROM notifications WHERE user_id = ? LIMIT 1", [adminId]);
  if (notifs.length === 0) {
    await connection.query(
      `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
      [adminId, 'Welcome Super Admin! Your system is ready.']
    );
    console.log('✅ Admin Notification seeded.');
  }

  await connection.end();
}

module.exports = seedInitialData;
// This script seeds initial data into the database for the Smart Inventory Management System.
// It creates a super admin user, a default supplier, a sample inventory product, and an