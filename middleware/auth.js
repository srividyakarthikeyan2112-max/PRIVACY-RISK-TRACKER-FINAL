const jwt  = require('jsonwebtoken');

// ✅ FIXED PATH
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.user_id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

const authorizeSelf = (req, res, next) => {
  const id = parseInt(req.params.user_id || req.params.id);

  if (req.user.role !== 'admin' && req.user.user_id !== id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  next();
};

module.exports = { authenticate, authorizeAdmin, authorizeSelf };
