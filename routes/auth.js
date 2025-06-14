// Authentication routes for user registration and login
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required.'
      });
    }

    // Check if user already exists
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

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password,
      role: role || 'user'
    });

    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    
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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed. Please try again.'
    });
  }
});

// GET /auth/profile - Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
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

// POST /auth/logout - Logout
router.post('/logout', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'Logout successful. Please remove the token from client storage.'
  });
});

module.exports = router;