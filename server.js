// 1. Basic setup
const express = require('express');           // Server setup
const dotenv = require('dotenv');              // Environment variables
const { Sequelize } = require('sequelize');    // Database connection
const incidentRoutes = require('./routes/incidents'); // Routes import
const morgan = require('morgan');              // Logger
const fs = require('fs');                      // File system
const path = require('path');                  // File path handle
const rateLimit = require('express-rate-limit'); // Rate limiter

const app = express();    // Express server instance

// 2. Environment Variables
dotenv.config();

// 3. Morgan Logging
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// 4. Body Parsing
app.use(express.json());

// 5. Rate Limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100,
});
app.use(limiter);

// 6. Database Connection
const sequelize = new Sequelize(process.env.DB_URL);
sequelize.authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Error: " + err));

// 7. Routes
app.use(incidentRoutes);

// 8. Test Route
app.get('/', (req, res) => {
  res.send('HumanChain API is running...');
});

// 9. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
