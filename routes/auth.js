// Authentication routes for user registration and login
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // Payload - contains user ID
    process.env.JWT_SECRET, // Secret key for signing
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } // Token expires in 7 days by default
  );
};

// POST /auth/register - User registration
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required.'
      });
    }

    // Check if user already exists (by email or username)
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email or username already exists.'
      });
    }

    // Create new user (password will be hashed automatically by model hook)
    const newUser = await User.create({
      username,
      email,
      password,
      role: role || 'user' // Default to 'user' role if not specified
    });

    // Generate JWT token for the new user
    const token = generateToken(newUser.id);

    // Return success response with token and user info (password excluded by toJSON method)
    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed.',
        details: validationErrors
      });
    }

    res.status(500).json({
      error: 'Registration failed. Please try again.'
    });
  }
});

// POST /auth/login - User login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    // Compare provided password with hashed password in database
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    // Generate JWT token for successful login
    const token = generateToken(user.id);

    // Return success response with token and user info
    res.status(200).json({
      message: 'Login successful.',
      token,
      user: user // Password excluded by toJSON method
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed. Please try again.'
    });
  }
});

// GET /auth/profile - Get current user profile (protected route)
router.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    // req.user is set by authenticateToken middleware
    res.status(200).json({
      message: 'Profile retrieved successfully.',
      user: req.user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile.'
    });
  }
});

// POST /auth/logout - Logout (client-side token removal)
router.post('/auth/logout', authenticateToken, (req, res) => {
  // Note: With JWT, logout is typically handled client-side by removing the token
  // Server-side logout would require token blacklisting, which is more complex
  res.status(200).json({
    message: 'Logout successful. Please remove the token from client storage.'
  });
});

module.exports = router;