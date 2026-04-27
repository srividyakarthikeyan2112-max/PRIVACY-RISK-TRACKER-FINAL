const express = require('express');
const router  = express.Router();

// ✅ FIXED PATHS
const { getUserProfile, updateUserProfile, changePassword } = require('../controllers/userController');
const { authenticate, authorizeSelf } = require('../middleware/auth');

router.get('/:user_id',                 authenticate, authorizeSelf, getUserProfile);
router.put('/:user_id',                 authenticate, authorizeSelf, updateUserProfile);
router.put('/:user_id/change-password', authenticate, authorizeSelf, changePassword);

module.exports = router;
