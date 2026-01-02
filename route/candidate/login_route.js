// route/candidate/login_route.js
const express = require('express');
const router = express.Router();
const controller = require('../../controller/candidate/login');
const auth = require('../../middleware/auth');

// Public Routes
router.get('/dropdowns', controller.getDropdowns); // For UI Select options
router.post('/register', controller.registerCandidate);
router.post('/login', controller.loginCandidate);

// Protected Routes (Requires JWT)
router.get('/me', auth, controller.getMe);

module.exports = router;