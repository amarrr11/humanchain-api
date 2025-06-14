// User model for authentication
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50] // Username must be between 3-50 characters
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true // Validates email format
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100] // Password must be at least 6 characters
    }
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user', // Default role is 'user'
    validate: {
      isIn: [['user', 'admin']] // Only 'user' or 'admin' roles allowed
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: false,
  hooks: {
    // Hash password before saving to database
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12); // Generate salt with cost factor 12
        user.password = await bcrypt.hash(user.password, salt); // Hash the password
      }
    },
    // Hash password before updating (in case password is changed)
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare password during login
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to hide password in JSON responses
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password; // Remove password from JSON output
  return values;
};

module.exports = User;