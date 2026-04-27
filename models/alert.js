const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alert = sequelize.define('Alert', {
  alert_id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:      { type: DataTypes.INTEGER, allowNull: false },
  date:         { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  message:      { type: DataTypes.TEXT, allowNull: false },
  status:       { type: DataTypes.ENUM('Pending', 'Sent', 'Read', 'Dismissed'), defaultValue: 'Pending' },
  alert_type:   { type: DataTypes.STRING(50), allowNull: true },
  read_date:    { type: DataTypes.DATE, allowNull: true },
  related_log_id:{ type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'alerts',
  timestamps: false,
});

module.exports = Alert;
