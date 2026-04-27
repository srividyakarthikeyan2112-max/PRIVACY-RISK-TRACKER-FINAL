const User = require('./users');
const BreachDatabase = require('./database'); // assuming this is your DB model
const LeakLog = require('./leaks');
const RiskScore = require('./riskService'); // adjust if different
const Alert = require('./alerts');

// USER → RISK_SCORE (1:1)
User.hasOne(RiskScore, { foreignKey: 'user_id', as: 'riskScore' });
RiskScore.belongsTo(User, { foreignKey: 'user_id' });

// USER → LEAK_LOG (1:M)
User.hasMany(LeakLog, { foreignKey: 'user_id', as: 'leaks' });
LeakLog.belongsTo(User, { foreignKey: 'user_id' });

// BREACH_DATABASE → LEAK_LOG (1:M)
BreachDatabase.hasMany(LeakLog, { foreignKey: 'breach_id', as: 'leaks' });
LeakLog.belongsTo(BreachDatabase, { foreignKey: 'breach_id', as: 'breach' });

// USER → ALERTS (1:M)
User.hasMany(Alert, { foreignKey: 'user_id', as: 'alerts' });
Alert.belongsTo(User, { foreignKey: 'user_id' });

// LEAK_LOG → ALERTS
LeakLog.hasMany(Alert, { foreignKey: 'related_log_id', as: 'alerts' });
Alert.belongsTo(LeakLog, { foreignKey: 'related_log_id', as: 'leak' });

module.exports = { User, BreachDatabase, LeakLog, RiskScore, Alert };
