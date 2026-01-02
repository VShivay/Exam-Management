const express = require('express');
const router = express.Router();
const candidateManager = require('../../controller/admin/manage_candidate');
const verifyToken = require('../../middleware/auth');

// All candidate management routes require admin login
router.get('/list', verifyToken, candidateManager.viewCandidates);
router.get('/profile/:id', verifyToken, candidateManager.getCandidateProfile);

module.exports = router;