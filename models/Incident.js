
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Database connection file

const Incident = sequelize.define('Incident', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  severity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reported_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW, // Setting default value to current timestamp
    allowNull: false
  }
}, {
  tableName: 'incidents', // Table name in the DB
  timestamps: false      
});

module.exports = Incident;