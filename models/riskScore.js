const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RiskScore = sequelize.define('RiskScore', {
  risk_id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:               { type: DataTypes.INTEGER, unique: true, allowNull: false },
  score:                 { type: DataTypes.INTEGER, defaultValue: 0 },
  risk_level:            { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'), defaultValue: 'Low' },
  leak_count:            { type: DataTypes.INTEGER, defaultValue: 0 },
  last_updated:          { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  critical_data_exposed: { type: DataTypes.BOOLEAN, defaultValue: false },
  calculation_details:   { type: DataTypes.JSON, allowNull: true },
}, {
  tableName: 'risk_scores',
  timestamps: false,
});

module.exports = RiskScore;
