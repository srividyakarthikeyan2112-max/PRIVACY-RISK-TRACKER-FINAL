const express = require('express');
const router  = express.Router();
const { addLeak, getUserLeaks, getLeakById } = require('./leakController');
const { authenticate, authorizeAdmin, authorizeSelf } = require('./auth');

router.post('/add',           authenticate, authorizeAdmin, addLeak);
router.get('/log/:log_id',    authenticate, getLeakById);
router.get('/:user_id',       authenticate, authorizeSelf, getUserLeaks);

module.exports = router;
