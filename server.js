require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ✅ FIXED PATH (config folder)
const { connectDB } = require('./config/database');

// ✅ FIXED PATH (models folder)
require('./models');

const app = express();


// ── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));


// ── Rate Limiting ───────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Try again later.' },
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Try again later.' },
});


// ── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// ── Routes (FILES IN ROUTES FOLDER) ──────────────────────────
app.use('/api/auth',      authLimiter, require('./routes/auth'));
app.use('/api/dashboard',              require('./routes/dashboard'));
app.use('/api/leaks',                  require('./routes/leaks'));
app.use('/api/alerts',                 require('./routes/alerts'));
app.use('/api/users',                  require('./routes/users'));
app.use('/api/admin',                  require('./routes/admin'));


// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Privacy Risk Tracker API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});


// ── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});


// ── Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});


// ── START SERVER FIRST (IMPORTANT FOR RENDER) ────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// ── CONNECT DATABASE AFTER SERVER START ─────────────────────
connectDB()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database connection failed:', err.message));


module.exports = app;
