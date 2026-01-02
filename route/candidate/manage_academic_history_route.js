const express = require('express');
const router = express.Router();
const academicController = require('../../controller/candidate/manage_academic_history');
const auth = require('../../middleware/auth');

// All routes here require authentication
router.use(auth);

router.get('/', academicController.getAcademicHistory);
router.post('/', academicController.addAcademicRecord);
router.put('/:id', academicController.updateAcademicRecord);
router.delete('/:id', academicController.deleteAcademicRecord);

module.exports = router;