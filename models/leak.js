const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeakLog = sequelize.define('LeakLog', {
  log_id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:      { type: DataTypes.INTEGER, allowNull: false },
  breach_id:    { type: DataTypes.INTEGER, allowNull: true },
  date_detected:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  data_type:    { type: DataTypes.STRING(100), allowNull: false },
  severity:     { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'), defaultValue: 'Medium' },
  notes:        { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'leak_logs',
  timestamps: false,
});

module.exports = LeakLog;
