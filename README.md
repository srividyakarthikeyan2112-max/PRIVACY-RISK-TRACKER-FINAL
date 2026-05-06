privacy-risk-tracker/
├── backend/
│   ├── config/
│   │   ├── database.js        # Sequelize MySQL connection
│   │   └── seed.js            # Sample data seeder
│   ├── controllers/
│   │   ├── authController.js      # Register + Login
│   │   ├── dashboardController.js # Dashboard aggregate data
│   │   ├── leakController.js      # Leak CRUD + transaction
│   │   ├── alertController.js     # Alert management
│   │   ├── userController.js      # Profile management
│   │   └── adminController.js     # Admin operations
│   ├── middleware/
│   │   └── auth.js            # JWT auth + role guards
│   ├── models/
│   │   ├── User.js
│   │   ├── BreachDatabase.js
│   │   ├── LeakLog.js
│   │   ├── RiskScore.js
│   │   ├── Alert.js
│   │   └── index.js           # Associations
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── leaks.js
│   │   ├── alerts.js
│   │   ├── users.js
│   │   └── admin.js
│   ├── services/
│   │   └── riskService.js     # Transaction logic (leak + risk + alert)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── utils/
    │   │   └── api.js           # Axios service layer
    │   ├── App.js               # Full app: all pages + components
    │   └── index.js
    └── package.json
