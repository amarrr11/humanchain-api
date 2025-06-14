// Enhanced server setup with JWT authentication
const express = require('express');           // Server setup
const dotenv = require('dotenv');              // Environment variables
const { Sequelize } = require('sequelize');    // Database connection
const incidentRoutes = require('./routes/incidents'); // Incident routes
const authRoutes = require('./routes/auth');   // Authentication routes
const morgan = require('morgan');              // HTTP request logger
const fs = require('fs');                      // File system operations
const path = require('path');                  // File path utilities
const rateLimit = require('express-rate-limit'); // Rate limiting middleware

const app = express();    // Express server instance

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required!');
  console.error('Please add JWT_SECRET to your .env file');
  process.exit(1); // Exit if JWT_SECRET is not set
}

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Morgan HTTP request logging
// Creates/appends to access.log file with detailed request information
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// Also log to console in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev')); // Colored, concise output for development
}

// Body parsing middleware
// Enables parsing of JSON request bodies
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting middleware
// Prevents abuse by limiting requests per IP address
const limiter = rateLimit({ 
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // Maximum 100 requests per minute per IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable legacy headers
});
app.use(limiter);

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 login/register attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Apply stricter rate limiting to auth routes
app.use('/auth', authLimiter);

// Database connection and synchronization
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'mysql',
  logging: false, // Disable SQL query logging (set to console.log to enable)
  pool: {
    max: 5,      // Maximum number of connections
    min: 0,      // Minimum number of connections
    acquire: 30000, // Maximum time to get connection (ms)
    idle: 10000  // Maximum time connection can be idle (ms)
  }
});

// Test database connection and sync models
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected successfully");
    
    // Sync database models (create tables if they don't exist)
    return sequelize.sync({ alter: false }); // Set to true to update existing tables
  })
  .then(() => {
    console.log("✅ Database models synchronized");
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1); // Exit if database connection fails
  });

// CORS middleware (if needed for frontend integration)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins (configure for production)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Route registration
app.use(authRoutes);      // Authentication routes (/auth/*)
app.use(incidentRoutes);  // Incident management routes (/incidents/*)

// Root endpoint - API status
app.get('/', (req, res) => {
  res.json({
    message: 'HumanChain AI Safety Incident Log API',
    version: '2.0.0',
    status: 'running',
    features: [
      'JWT Authentication',
      'Incident Management',
      'Rate Limiting',
      'Request Logging'
    ],
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        profile: 'GET /auth/profile (requires token)',
        logout: 'POST /auth/logout (requires token)'
      },
      incidents: {
        list: 'GET /incidents',
        create: 'POST /incidents (requires token)',
        get: 'GET /incidents/:id',
        update: 'PUT /incidents/:id (requires token)',
        delete: 'DELETE /incidents/:id (requires admin token)'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.status || 500).json({
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'Something went wrong',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Access logs: ${path.join(__dirname, 'logs', 'access.log')}`);
  console.log(`🔐 JWT Authentication enabled`);
  console.log(`⚡ Rate limiting: 100 requests/minute, 5 auth attempts/15 minutes`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  sequelize.close().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  sequelize.close().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});