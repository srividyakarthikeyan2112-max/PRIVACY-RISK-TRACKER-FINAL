const { Alert } = require('../index');
const { Op } = require('sequelize');

// GET /api/alerts/:user_id
const getUserAlerts = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status, alert_type, page = 1, limit = 20 } = req.query;

    const where = { user_id };
    if (status)     where.status     = status;
    if (alert_type) where.alert_type = alert_type;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Alert.findAndCountAll({
      where,
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    const unread = await Alert.count({
      where: { user_id, status: { [Op.in]: ['Pending', 'Sent'] } },
    });

    res.json({
      success: true,
      data: {
        alerts: rows,
        unread,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/alerts/:id/read
const markAlertRead = async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    await alert.update({ status: 'Read', read_date: new Date() });
    res.json({ success: true, message: 'Alert marked as read', data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/alerts/:id/dismiss
const dismissAlert = async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    await alert.update({ status: 'Dismissed' });
    res.json({ success: true, message: 'Alert dismissed', data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/alerts/read-all/:user_id
const markAllRead = async (req, res) => {
  try {
    const [updated] = await Alert.update(
      { status: 'Read', read_date: new Date() },
      { where: { user_id: req.params.user_id, status: { [Op.in]: ['Pending', 'Sent'] } } }
    );
    res.json({ success: true, message: `${updated} alerts marked as read` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUserAlerts, markAlertRead, dismissAlert, markAllRead };
