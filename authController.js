const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('./database');
const { User, RiskScore } = require('./index');

const generateToken = (user) =>
  jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
const register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, phone, password, pan, role, admin_secret } = req.body;
    if (!name || !email || !password) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      await t.rollback();
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const password_hash = await bcrypt.hash(password, 12);
    const userRole = role === 'admin' && admin_secret === process.env.ADMIN_SECRET ? 'admin' : 'user';

    const user = await User.create({
      member_id: `MEM-${uuidv4().substring(0,8).toUpperCase()}`,
      data_id:   `DAT-${uuidv4().substring(0,8).toUpperCase()}`,
      name, email, phone: phone || null, pan: pan || null,
      password_hash, role: userRole,
      created_date: new Date(), last_updated: new Date(), is_active: true,
    }, { transaction: t });

    await RiskScore.create({
      user_id: user.user_id, score: 0, risk_level: 'Low',
      leak_count: 0, last_updated: new Date(),
    }, { transaction: t });

    await t.commit();
    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: { token: generateToken(user), user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ where: { email, is_active: true } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: generateToken(user),
        user: { user_id: user.user_id, member_id: user.member_id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
const getMe = (req, res) => res.json({ success: true, data: req.user });

module.exports = { register, login, getMe };
