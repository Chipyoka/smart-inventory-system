require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Route files (standardized names)
const authRoutes = require("./routes/authRoutes"); 
const inventoryRoutes = require("./routes/inventoryRoutes");
const externalLookupRoute = require('./routes/externalLookup'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use('/api/external-lookup', externalLookupRoute);

// Root Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
