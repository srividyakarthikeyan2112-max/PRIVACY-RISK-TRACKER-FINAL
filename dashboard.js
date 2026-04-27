const express = require('express');
const router  = express.Router();
const { getDashboard } = require('./dashboardController');
const { authenticate, authorizeSelf } = require('./auth');

router.get('/:user_id', authenticate, authorizeSelf, getDashboard);

module.exports = router;
