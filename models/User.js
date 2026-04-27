const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  member_id: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
  data_id: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  pan: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  aadhaar_hash: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  photo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  created_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  last_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;
