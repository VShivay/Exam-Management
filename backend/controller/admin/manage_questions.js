const pool = require('../../db'); // Assuming you have a DB config
const Joi = require('joi');

// Get all domains for the dropdown menu
exports.getDomains = async (req, res) => {
    try {
        const result = await pool.query('SELECT domain_id, domain_name FROM domains ORDER BY domain_name ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch domains' });
    }
};

// View MCQs with Pagination and Domain Filtering
exports.getQuestions = async (req, res) => {
    const { domain_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT q.*, d.domain_name 
            FROM questions q
            JOIN domains d ON q.domain_id = d.domain_id
        `;
        let params = [];

        // Apply domain filter if provided
        if (domain_id) {
            query += ` WHERE q.domain_id = $1`;
            params.push(domain_id);
        }

        // Add Pagination
        query += ` ORDER BY q.question_id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        
        // Get total count for frontend pagination metadata
        const countQuery = domain_id ? 'SELECT COUNT(*) FROM questions WHERE domain_id = $1' : 'SELECT COUNT(*) FROM questions';
        const totalCount = await pool.query(countQuery, domain_id ? [domain_id] : []);

        res.status(200).json({
            data: result.rows,
            total: parseInt(totalCount.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error while fetching questions' });
    }
};
const questionSchema = Joi.object({
    domain_id: Joi.number().integer().required(),
    question_text: Joi.string().min(5).required(),
    option_a: Joi.string().max(255).required(),
    option_b: Joi.string().max(255).required(),
    option_c: Joi.string().max(255).required(),
    option_d: Joi.string().max(255).required(),
    correct_option: Joi.string().valid('A', 'B', 'C', 'D').required(),
    difficulty_level: Joi.string().valid('Easy', 'Medium', 'Hard', 'Expert').default('Medium')
});

// Add a New Question
exports.addQuestion = async (req, res) => {
    // 1. Validate request body
    const { error, value } = questionSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({ 
            error: error.details[0].message 
        });
    }

    const { 
        domain_id, 
        question_text, 
        option_a, 
        option_b, 
        option_c, 
        option_d, 
        correct_option, 
        difficulty_level 
    } = value;

    try {
        const query = `
            INSERT INTO questions (
                domain_id, question_text, option_a, option_b, 
                option_c, option_d, correct_option, difficulty_level
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *;
        `;
        
        const values = [
            domain_id, question_text, option_a, option_b, 
            option_c, option_d, correct_option, difficulty_level
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Question added successfully',
            question: result.rows[0]
        });
    } catch (err) {
        console.error("DB Error:", err.message);
        
        // Handle Foreign Key Violation (if domain_id doesn't exist)
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Invalid domain ID provided.' });
        }

        res.status(500).json({ error: 'Database error while saving question.' });
    }
};