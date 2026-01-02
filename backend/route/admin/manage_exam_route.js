const express = require('express');
const router = express.Router();
const examController = require('../../controller/admin/manage_exam');
const auth = require('../../middleware/auth');
const Joi = require('joi');

// Validation Schema
const validateQuery = (req, res, next) => {
    const schema = Joi.object({
        domain: Joi.string().optional(),
        student_name: Joi.string().optional(),
        date_filter: Joi.string().valid('today', 'last_week', 'last_month', 'last_year', 'custom').optional(),
        start_date: Joi.date().iso().when('date_filter', { is: 'custom', then: Joi.required() }),
        end_date: Joi.date().iso().when('date_filter', { is: 'custom', then: Joi.required() })
    });

    const { error } = schema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
};

// Routes
// Fetch all results with filters
router.get('/results', auth, validateQuery, examController.getExamResults);

// Fetch specific result detail
router.get('/results/:id', auth, examController.getExamDetail);

// Delete a result
router.delete('/results/:id', auth, examController.deleteExamResult);

module.exports = router;