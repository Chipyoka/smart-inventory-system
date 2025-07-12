const express = require('express');
const http = require('http');
const cors = require('cors');
const passport = require('./middleware/auth');
require('dotenv').config();

const initSchema = require('./init/schemaInit');
const seedInitialData = require('./init/seedData');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();
const server = http.createServer(app);

(async () => {
  try {
    await initSchema();
    await seedInitialData();
  } catch (err) {
    console.error('❌ Initialization failed:', err.message);
    process.exit(1);
  }
})();

app.use(cors({
  origin: '*', // Allow all origins for development
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => res.send('SIMS Backend Running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});


// This is the main server file for the Smart Inventory Management System (SIMS) backend.
// It sets up the Express server, applies middleware, and defines routes for authentication and inventory management