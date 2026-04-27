const express = require('express');
const router  = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { authenticate, authorizeSelf } = require('../middleware/auth');

router.get('/:user_id', authenticate, authorizeSelf, getDashboard);

module.exports = router;
