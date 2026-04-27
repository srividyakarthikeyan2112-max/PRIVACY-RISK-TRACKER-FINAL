const { User, BreachDatabase, LeakLog, RiskScore, Alert } = require('../index');
const { sequelize } = require('../database');
const { Op, fn, col, literal } = require('sequelize');

// POST /api/admin/breach/add
const addBreach = async (req, res) => {
  try {
    const { leaked_email, leaked_phone, leaked_pwd_hash, source, breach_year, discovery_date, record_count, description } = req.body;
    if (!source) return res.status(400).json({ success: false, message: 'source is required' });
    const breach = await BreachDatabase.create({ leaked_email, leaked_phone, leaked_pwd_hash, source, breach_year, discovery_date, record_count, description });
    res.status(201).json({ success: true, message: 'Breach added', data: breach });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { name:      { [Op.like]: `%${search}%` } },
        { email:     { [Op.like]: `%${search}%` } },
        { member_id: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash', 'aadhaar_hash'] },
      include: [{ model: RiskScore, as: 'riskScore' }],
      order: [['created_date', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    res.json({
      success: true,
      data: { users: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/leaks
const getAllLeaks = async (req, res) => {
  try {
    const { page = 1, limit = 20, severity, user_id } = req.query;
    const where = {};
    if (severity) where.severity = severity;
    if (user_id)  where.user_id  = user_id;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await LeakLog.findAndCountAll({
      where,
      include: [
        { model: User,          attributes: ['name', 'email', 'member_id'] },
        { model: BreachDatabase, as: 'breach', attributes: ['source', 'breach_year', 'record_count'] },
      ],
      order: [['date_detected', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    res.json({
      success: true,
      data: { leaks: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalUsers, totalLeaks, totalBreaches, criticalLeaks, highLeaks, pendingAlerts, recentLeaks] = await Promise.all([
      User.count({ where: { role: 'user', is_active: true } }),
      LeakLog.count(),
      BreachDatabase.count(),
      LeakLog.count({ where: { severity: 'Critical' } }),
      LeakLog.count({ where: { severity: 'High' } }),
      Alert.count({ where: { status: { [Op.in]: ['Pending', 'Sent'] } } }),
      LeakLog.count({ where: { date_detected: { [Op.gte]: thirtyDaysAgo } } }),
    ]);

    const [riskDistribution, leaksByType, leaksBySeverity, topRiskUsers] = await Promise.all([
      RiskScore.findAll({ attributes: ['risk_level', [fn('COUNT', col('risk_id')), 'count']], group: ['risk_level'], raw: true }),
      LeakLog.findAll({ attributes: ['data_type', [fn('COUNT', col('log_id')), 'count']], group: ['data_type'], raw: true }),
      LeakLog.findAll({ attributes: ['severity', [fn('COUNT', col('log_id')), 'count']], group: ['severity'], raw: true }),
      RiskScore.findAll({ order: [['score', 'DESC']], limit: 5, include: [{ model: User, attributes: ['name', 'email', 'member_id'] }] }),
    ]);

    res.json({
      success: true,
      data: { overview: { totalUsers, totalLeaks, totalBreaches, criticalLeaks, highLeaks, pendingAlerts, recentLeaks }, riskDistribution, leaksByType, leaksBySeverity, topRiskUsers },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/breaches
const getAllBreaches = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await BreachDatabase.findAndCountAll({ order: [['discovery_date', 'DESC']], limit: parseInt(limit), offset });
    res.json({ success: true, data: { breaches: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id/toggle-active
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.update({ is_active: !user.is_active, last_updated: new Date() });
    res.json({ success: true, message: `User ${user.is_active ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addBreach, getAllUsers, getAllLeaks, getAnalytics, getAllBreaches, toggleUserActive };
