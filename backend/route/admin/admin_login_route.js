const express = require('express');
const router = express.Router();
const adminController = require('../../controller/admin/admin_login');
const verifyToken = require('../../middleware/auth');

// Public route
router.post('/login', adminController.adminLogin);

// Protected route (requires JWT)
router.get('/me', verifyToken, adminController.getMe);

module.exports = router;