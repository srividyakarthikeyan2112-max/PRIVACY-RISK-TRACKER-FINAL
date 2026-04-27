const { User, RiskScore, LeakLog, Alert, BreachDatabase } = require('../models');
const { Op } = require('sequelize');
const { getRiskTrend } = require('../services/riskService');

// GET /api/dashboard/:user_id
const getDashboard = async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash', 'aadhaar_hash'] },
      include: [{ model: RiskScore, as: 'riskScore' }],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [recentLeaks, recentAlerts, totalLeaks, criticalLeaks, unreadCount, riskTrend] = await Promise.all([
      LeakLog.findAll({
        where: { user_id: userId },
        order: [['date_detected', 'DESC']],
        limit: 5,
        include: [{ model: BreachDatabase, as: 'breach', attributes: ['source', 'breach_year', 'record_count'] }],
      }),
      Alert.findAll({
        where: { user_id: userId },
        order: [['date', 'DESC']],
        limit: 5,
      }),
      LeakLog.count({ where: { user_id: userId } }),
      LeakLog.count({ where: { user_id: userId, severity: 'Critical' } }),
      Alert.count({ where: { user_id: userId, status: { [Op.in]: ['Pending', 'Sent'] } } }),
      getRiskTrend(userId),
    ]);

    res.json({
      success: true,
      data: {
        user: {
          user_id:   user.user_id,
          name:      user.name,
          email:     user.email,
          phone:     user.phone,
          member_id: user.member_id,
          pan:       user.pan,
          photo:     user.photo,
          role:      user.role,
        },
        riskScore:    user.riskScore,
        recentLeaks,
        recentAlerts,
        riskTrend,
        stats: { totalLeaks, criticalLeaks, unreadAlerts: unreadCount },
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard };
