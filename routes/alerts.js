const express = require('express');
const router  = express.Router();
const { getUserAlerts, markAlertRead, dismissAlert, markAllRead } = require('../controllers/alertController');
const { authenticate, authorizeSelf } = require('../middleware/auth');

router.get('/read-all/:user_id', authenticate, authorizeSelf, markAllRead);
router.get('/:user_id',          authenticate, authorizeSelf, getUserAlerts);
router.put('/:id/read',          authenticate, markAlertRead);
router.put('/:id/dismiss',       authenticate, dismissAlert);

module.exports = router;
