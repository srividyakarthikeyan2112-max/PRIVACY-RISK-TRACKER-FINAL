# 📁 PRIVACY-RISK-TRACKER-FINAL

## Project Structure

```
PRIVACY-RISK-TRACKER-FINAL/

├── server.js                    # Main Express server
├── package.json                 # Dependencies

├── config/
│   └── database.js              # Sequelize & MySQL config

├── models/
│   ├── index.js                 # Model associations & exports
│   ├── User.js                  # User model definition
│   ├── alert.js                 # Alert model definition
│   ├── leak.js                  # LeakLog model definition
│   ├── riskScore.js             # RiskScore model definition
│   └── breachDatabase.js        # BreachDatabase model definition

├── controllers/
│   ├── userController.js        # User profile, password change
│   ├── alertController.js       # Alert management
│   ├── leakController.js        # Leak logging & retrieval
│   ├── adminController.js       # Admin analytics & management
│   ├── authController.js        # Auth register/login
│   └── dashboardController.js   # Dashboard data aggregation

├── routes/
│   ├── users.js                 # /api/users routes
│   ├── alerts.js                # /api/alerts routes
│   ├── leaks.js                 # /api/leaks routes
│   ├── admin.js                 # /api/admin routes
│   ├── auth.js                  # /api/auth routes
│   └── dashboard.js             # /api/dashboard routes

├── middleware/
│   └── auth.js                  # JWT authentication & authorization

├── services/
│   └── riskService.js           # Risk calculation logic

├── seed/                        # Seeding scripts (if any)
│   ├── seed.sql
│   └── seedSequelize.js

└── .git/                        # Git repository
```

---

## 📝 Import Conventions

All imports follow the relative path pattern from the current location:

### ✅ Controllers
```javascript
const { User, RiskScore, LeakLog } = require('../models');
const { authenticate, authorizeSelf } = require('../middleware/auth');
const { addLeakWithTransaction } = require('../services/riskService');
const { sequelize } = require('../config/database');
```

### ✅ Routes
```javascript
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { authenticate, authorizeSelf } = require('../middleware/auth');
```

### ✅ Middleware
```javascript
const { User } = require('../models');
```

### ✅ Services
```javascript
const { sequelize } = require('../config/database');
const { LeakLog, RiskScore, Alert } = require('../models');
```

### ✅ Models
```javascript
const { sequelize } = require('../config/database');
```

### ✅ Server
```javascript
const { connectDB } = require('./config/database');
require('./models');

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/leaks',     require('./routes/leaks'));
app.use('/api/alerts',    require('./routes/alerts'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/admin',     require('./routes/admin'));
```

---

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (authenticated)

### Users
- `GET /api/users/:user_id` - Get user profile
- `PUT /api/users/:user_id` - Update user profile
- `PUT /api/users/:user_id/change-password` - Change password

### Alerts
- `GET /api/alerts/:user_id` - Get user alerts
- `GET /api/alerts/read-all/:user_id` - Mark all alerts as read
- `PUT /api/alerts/:id/read` - Mark alert as read
- `PUT /api/alerts/:id/dismiss` - Dismiss alert

### Leaks
- `GET /api/leaks/:user_id` - Get user leaks
- `GET /api/leaks/log/:log_id` - Get specific leak details
- `POST /api/leaks/add` - Add new leak (admin only)

### Dashboard
- `GET /api/dashboard/:user_id` - Get dashboard data

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/toggle-active` - Toggle user status
- `GET /api/admin/leaks` - Get all leaks
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/breaches` - Get all breaches
- `POST /api/admin/breach/add` - Add new breach

---

## 🗄️ Database Models

### User
- user_id, member_id, data_id, name, email, password_hash, phone, pan, aadhaar_hash, photo, role, is_active, created_date, last_updated

### RiskScore
- risk_id, user_id, score, risk_level, leak_count, last_updated, critical_data_exposed, calculation_details

### LeakLog
- log_id, user_id, breach_id, date_detected, data_type, severity, notes

### Alert
- alert_id, user_id, date, message, status, alert_type, read_date, related_log_id

### BreachDatabase
- breach_id, leaked_email, leaked_phone, leaked_pwd_hash, source, breach_year, discovery_date, record_count, description

---

## 📦 Dependencies

See `package.json` for complete list. Key dependencies:
- express
- sequelize
- mysql2
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- helmet
- express-rate-limit

---

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Password hashing (bcryptjs)
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Transaction-based operations
- ✅ Role-based authorization

---

## ⚙️ Environment Variables

Create a `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=privacy_risk_tracker
DB_PORT=3306
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_SECRET=your_admin_secret
NODE_ENV=development
PORT=5000
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start server
npm start

# Or with nodemon
npm run dev
```

The API will be available at `http://localhost:5000`

---

**Last Updated:** April 27, 2026
