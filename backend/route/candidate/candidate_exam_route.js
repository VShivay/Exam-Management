const express = require('express');
const router = express.Router();
const examController = require('../../controller/candidate/candidate_exam');
const auth = require('../../middleware/auth'); // Ensure this path is correct based on your folder structure

// Get Exam Questions (Randomized)
router.get('/generate', auth, examController.generateExam);

// Submit Exam Answers
router.post('/submit', auth, examController.submitExam);

// ... existing routes
router.get('/result', auth, examController.getExamResult); // Add this line
module.exports = router;