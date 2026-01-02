const db = require('../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Validation Schema
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

exports.adminLogin = async (req, res) => {
    try {
        // 1. Validate Request Body
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = req.body;

        // 2. Check if Admin exists
        const result = await db.query('SELECT * FROM admins WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const admin = result.rows[0];

        // 3. Verify Password
        const validPassword = await bcrypt.compare(password, admin.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            { id: admin.admin_id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token: token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        // req.user comes from the verifyToken middleware
        const result = await db.query(
            `SELECT a.admin_id, a.full_name, a.email, a.role, d.domain_name 
             FROM admins a 
             LEFT JOIN domains d ON a.assigned_domain_id = d.domain_id 
             WHERE a.admin_id = $1`, 
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Admin not found.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};