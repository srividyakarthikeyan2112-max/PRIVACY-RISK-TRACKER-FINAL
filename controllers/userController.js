const bcrypt  = require('bcryptjs');
const { User, RiskScore, LeakLog } = require('../models');

// GET /api/users/:user_id
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.user_id, {
      attributes: { exclude: ['password_hash', 'aadhaar_hash'] },
      include: [{ model: RiskScore, as: 'riskScore' }],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [totalLeaks, criticalLeaks] = await Promise.all([
      LeakLog.count({ where: { user_id: req.params.user_id } }),
      LeakLog.count({ where: { user_id: req.params.user_id, severity: 'Critical' } }),
    ]);

    res.json({ success: true, data: { ...user.toJSON(), stats: { totalLeaks, criticalLeaks } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/:user_id
const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, pan } = req.body;
    const user = await User.findByPk(req.params.user_id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.update({ name, phone, pan, last_updated: new Date() });
    res.json({ success: true, message: 'Profile updated', data: { name: user.name, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/:user_id/change-password
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.params.user_id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const match = await bcrypt.compare(current_password, user.password_hash);
    if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    await user.update({ password_hash: await bcrypt.hash(new_password, 12), last_updated: new Date() });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, changePassword };
