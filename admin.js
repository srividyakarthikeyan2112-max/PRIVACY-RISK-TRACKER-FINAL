const express = require('express');
const router  = express.Router();
const { addBreach, getAllUsers, getAllLeaks, getAnalytics, getAllBreaches, toggleUserActive } = require('./adminController');
const { authenticate, authorizeAdmin } = require('./auth');

router.use(authenticate, authorizeAdmin);

router.post('/breach/add',            addBreach);
router.get('/breaches',               getAllBreaches);
router.get('/users',                  getAllUsers);
router.put('/users/:id/toggle-active',toggleUserActive);
router.get('/leaks',                  getAllLeaks);
router.get('/analytics',              getAnalytics);

module.exports = router;
