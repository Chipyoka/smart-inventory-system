require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import verifyToken middleware
const { verifyToken } = require('./middleware/authMiddleware');

// Route files (standardized names)
const authRoutes = require("./routes/authRoutes"); 
const inventoryRoutes = require("./routes/inventoryRoutes");
const itemRoutes = require('./routes/itemRoutes');
const externalLookupRoute = require('./routes/externalLookup'); 
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/reports', verifyToken, reportRoutes);
app.use('/api/external-lookup', externalLookupRoute);
app.use('/api/analytics', verifyToken, analyticsRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
