const db = require('../../db');
const Joi = require('joi');

// Joi Validation Schema
const academicSchema = Joi.object({
    exam_name: Joi.string().max(100).required(),
    board_or_university: Joi.string().max(150).required(),
    passing_year: Joi.number().integer().min(1901).max(new Date().getFullYear()).required(),
    percentage_or_cgpa: Joi.number().precision(2).min(0).max(100).required()
});

// GET: View all academic records for the logged-in candidate
exports.getAcademicHistory = async (req, res) => {
    try {
        const candidateId = req.user.candidate_id; 
        const result = await db.query(
            'SELECT * FROM academic_history WHERE candidate_id = $1 ORDER BY passing_year DESC',
            [candidateId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching history' });
    }
};

// POST: Add a new academic record
exports.addAcademicRecord = async (req, res) => {
    const { error } = academicSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { exam_name, board_or_university, passing_year, percentage_or_cgpa } = req.body;
    const candidateId = req.user.candidate_id;

    try {
        const result = await db.query(
            `INSERT INTO academic_history (candidate_id, exam_name, board_or_university, passing_year, percentage_or_cgpa) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [candidateId, exam_name, board_or_university, passing_year, percentage_or_cgpa]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.constraint === 'uk_candidate_exam') {
            return res.status(400).json({ error: 'This exam record already exists for your profile.' });
        }
        res.status(500).json({ error: 'Server error while adding record' });
    }
};

// PUT: Update an existing record
exports.updateAcademicRecord = async (req, res) => {
    const { id } = req.params; // history_id
    const { error } = academicSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { exam_name, board_or_university, passing_year, percentage_or_cgpa } = req.body;
    const candidateId = req.user.candidate_id;

    try {
        const result = await db.query(
            `UPDATE academic_history 
             SET exam_name = $1, board_or_university = $2, passing_year = $3, percentage_or_cgpa = $4 
             WHERE history_id = $5 AND candidate_id = $6 RETURNING *`,
            [exam_name, board_or_university, passing_year, percentage_or_cgpa, id, candidateId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found or unauthorized' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error while updating record' });
    }
};

// DELETE: Remove a record
exports.deleteAcademicRecord = async (req, res) => {
    const { id } = req.params;
    const candidateId = req.user.candidate_id;

    try {
        const result = await db.query(
            'DELETE FROM academic_history WHERE history_id = $1 AND candidate_id = $2',
            [id, candidateId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found or unauthorized' });
        }
        res.status(200).json({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error while deleting record' });
    }
};