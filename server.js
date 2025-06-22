// Basic setup
const express = require('express');                  // Server setup
const dotenv = require('dotenv');                    // Environment variables
const incidentRoutes = require('./routes/incidents'); // Incident Routes
const authRoutes = require('./routes/auth');         // Auth Routes
const morgan = require('morgan');                    // Logger
const fs = require('fs');                            // File system
const path = require('path');                        // Path handling
const rateLimit = require('express-rate-limit');     // Rate limiter
const sequelize = require('./config/database');      // ✅ Import shared sequelize instance
require('./models/user');                            // ✅ Register User model

const app = express(); // Express server instance

// Load environment variables
dotenv.config();

// Create log stream for morgan
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

// Body parser middleware
app.use(express.json());

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
});
app.use(limiter);

// Authenticate DB connection
sequelize.authenticate()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// Sync models (auto-create table)
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Models synced'))
  .catch(err => console.error('❌ Model Sync Error:', err));

// Routes
app.use('/', authRoutes);         // handles /register, /login
app.use('/', incidentRoutes);

// Health route
app.get('/', (req, res) => {
  res.send('🚀 HumanChain API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});
