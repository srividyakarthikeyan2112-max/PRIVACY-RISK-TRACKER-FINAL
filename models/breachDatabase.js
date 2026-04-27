const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BreachDatabase = sequelize.define('BreachDatabase', {
  breach_id:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  leaked_email: { type: DataTypes.BOOLEAN, defaultValue: false },
  leaked_phone: { type: DataTypes.BOOLEAN, defaultValue: false },
  leaked_pwd_hash:{ type: DataTypes.BOOLEAN, defaultValue: false },
  source:       { type: DataTypes.STRING(100), allowNull: false },
  breach_year:  { type: DataTypes.INTEGER, allowNull: true },
  discovery_date:{ type: DataTypes.DATE, allowNull: true },
  record_count: { type: DataTypes.INTEGER, allowNull: true },
  description:  { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'breach_databases',
  timestamps: false,
});

module.exports = BreachDatabase;
