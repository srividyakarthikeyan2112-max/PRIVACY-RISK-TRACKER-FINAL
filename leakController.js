const { LeakLog, BreachDatabase, User } = require('./index');
const { addLeakWithTransaction } = require('./riskService');
const { Op } = require('sequelize');

// POST /api/leaks/add
const addLeak = async (req, res) => {
  try {
    const { user_id, breach_id, data_type, severity, notes } = req.body;
    if (!user_id || !data_type || !severity) {
      return res.status(400).json({ success: false, message: 'user_id, data_type and severity are required' });
    }
    const result = await addLeakWithTransaction({ user_id, breach_id, data_type, severity, notes });
    res.status(201).json({ success: true, message: 'Leak recorded. Risk score and alert updated.', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/leaks/:user_id
const getUserLeaks = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { severity, data_type, start_date, end_date, page = 1, limit = 10 } = req.query;

    const where = { user_id };
    if (severity)  where.severity  = severity;
    if (data_type) where.data_type = data_type;
    if (start_date || end_date) {
      where.date_detected = {};
      if (start_date) where.date_detected[Op.gte] = new Date(start_date);
      if (end_date)   where.date_detected[Op.lte] = new Date(end_date);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await LeakLog.findAndCountAll({
      where,
      order: [['date_detected', 'DESC']],
      limit: parseInt(limit),
      offset,
      include: [{ model: BreachDatabase, as: 'breach', attributes: ['source', 'breach_year', 'record_count', 'description'] }],
    });

    res.json({
      success: true,
      data: {
        leaks: rows,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/leaks/log/:log_id
const getLeakById = async (req, res) => {
  try {
    const leak = await LeakLog.findByPk(req.params.log_id, {
      include: [
        { model: BreachDatabase, as: 'breach' },
        { model: User, attributes: ['name', 'email', 'member_id'] },
      ],
    });
    if (!leak) return res.status(404).json({ success: false, message: 'Leak not found' });
    res.json({ success: true, data: leak });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addLeak, getUserLeaks, getLeakById };
