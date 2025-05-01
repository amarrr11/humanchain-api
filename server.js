// Basic setup
const express = require('express');           // Server setup
const dotenv = require('dotenv');              // Environment variables
const { Sequelize } = require('sequelize');    // Database connection
const incidentRoutes = require('./routes/incidents'); // Routes import
const morgan = require('morgan');              // Logger
const fs = require('fs');                      // File system
const path = require('path');                  // File path handle
const rateLimit = require('express-rate-limit'); // Rate limiter

const app = express();    // Express server instance

// Environment Variables
dotenv.config();

// Morgan Logging
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// Body Parsing
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({ 
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100,
});
app.use(limiter);

// Database Connection
const sequelize = new Sequelize(process.env.DB_URL);
sequelize.authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Error: " + err));

// Routes
app.use(incidentRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('HumanChain API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
