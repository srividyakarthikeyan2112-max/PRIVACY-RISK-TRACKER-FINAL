const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'privacy_risk_tracker',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define:  { timestamps: false, underscored: true },
  }
);

const connectDB = async () => {
  await sequelize.authenticate();
  console.log('✅ MySQL connected');
  // Only sync in development, never alter in production
  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ force: false });
    console.log('✅ Models synced');
  }
};

module.exports = { sequelize, connectDB };
