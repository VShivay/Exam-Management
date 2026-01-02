const express = require('express');
const router = express.Router();
const questionController = require('../../controller/admin/manage_questions');
const verifyToken = require('../../middleware/auth');

/**
 * @route   GET /api/questions/domains
 * @desc    Fetch domains for dropdowns
 * @access  Private
 */
router.get('/domains', verifyToken, questionController.getDomains);

/**
 * @route   GET /api/questions
 * @desc    Get paginated questions with optional domain filter
 * @access  Private
 */
router.get('/', verifyToken, questionController.getQuestions);

router.post('/add', verifyToken, questionController.addQuestion);

module.exports = router;