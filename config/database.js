// config/database.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database connection using Sequelize
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'mysql',
  logging: false  
});

module.exports = sequelize;
