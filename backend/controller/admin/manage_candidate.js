const db = require('../../db');
const Joi = require('joi');
const moment = require('moment');

// Validation for filtering
const filterSchema = Joi.object({
    name: Joi.string().allow(''),
    domain_id: Joi.number().integer().allow(null),
    gender: Joi.string().valid('Male', 'Female', 'Other').allow(''),
    date_filter: Joi.string().valid('today', 'week', 'month', 'year', 'custom').allow(''),
    start_date: Joi.date().iso().when('date_filter', { is: 'custom', then: Joi.required() }),
    end_date: Joi.date().iso().when('date_filter', { is: 'custom', then: Joi.required() })
});

// 1. View Candidates with Filters
exports.viewCandidates = async (req, res) => {
    try {
        const { error, value } = filterSchema.validate(req.query);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, domain_id, gender, date_filter, start_date, end_date } = value;

        let query = `
            SELECT c.candidate_id, c.first_name, c.last_name, c.email, c.gender, 
                   c.registered_at, d.domain_name 
            FROM candidates c
            LEFT JOIN domains d ON c.domain_id = d.domain_id
            WHERE 1=1`;
        
        const params = [];

        // Filter by Name
        if (name) {
            params.push(`%${name}%`);
            query += ` AND (c.first_name ILIKE $${params.length} OR c.last_name ILIKE $${params.length})`;
        }

        // Filter by Domain
        if (domain_id) {
            params.push(domain_id);
            query += ` AND c.domain_id = $${params.length}`;
        }

        // Filter by Gender
        if (gender) {
            params.push(gender);
            query += ` AND c.gender = $${params.length}`;
        }

        // Filter by Registration Date
        if (date_filter) {
            let start, end = moment().endOf('day').toISOString();

            if (date_filter === 'today') start = moment().startOf('day').toISOString();
            else if (date_filter === 'week') start = moment().subtract(7, 'days').toISOString();
            else if (date_filter === 'month') start = moment().subtract(1, 'months').toISOString();
            else if (date_filter === 'year') start = moment().subtract(1, 'years').toISOString();
            else if (date_filter === 'custom') {
                start = moment(start_date).startOf('day').toISOString();
                end = moment(end_date).endOf('day').toISOString();
            }

            params.push(start, end);
            query += ` AND c.registered_at BETWEEN $${params.length - 1} AND $${params.length}`;
        }

        query += ` ORDER BY c.registered_at DESC`;

        const result = await db.query(query, params);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 2. View All Info about Specific Candidate
exports.getCandidateProfile = async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch Personal Info
        const personalInfo = await db.query(
            `SELECT c.*, d.domain_name FROM candidates c 
             LEFT JOIN domains d ON c.domain_id = d.domain_id 
             WHERE c.candidate_id = $1`, [id]
        );

        if (personalInfo.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });

        // Fetch Academic History
        const academics = await db.query(
            `SELECT * FROM academic_history WHERE candidate_id = $1`, [id]
        );

        // Fetch Exam Results
        const results = await db.query(
            `SELECT er.*, d.domain_name FROM exam_results er 
             LEFT JOIN domains d ON er.domain_id = d.domain_id 
             WHERE er.candidate_id = $1 ORDER BY er.exam_date DESC`, [id]
        );

        res.status(200).json({
            profile: personalInfo.rows[0],
            academics: academics.rows,
            exam_history: results.rows
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};