const db = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
// THIS LINE WAS MISSING OR NOT ADDED:
const { format } = require('date-fns'); 

// --- VALIDATION SCHEMAS ---

const registerSchema = Joi.object({
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone_number: Joi.string().pattern(/^[0-9]+$/).min(10).required(),
    date_of_birth: Joi.date().optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    address: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    // FIX: Added .allow('') so empty strings don't fail validation
    linkedin_profile: Joi.string().uri().allow(null, '').optional(),
    domain_id: Joi.number().integer().optional()
});
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// --- CONTROLLERS ---

// 1. Fetch Dropdowns (Domains) for UI
exports.getDropdowns = async (req, res) => {
    try {
        const domainsResult = await db.query('SELECT domain_id, domain_name FROM domains ORDER BY domain_name ASC');
        res.status(200).json({
            domains: domainsResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching dropdowns.' });
    }
};

// 2. Candidate Registration
exports.registerCandidate = async (req, res) => {
    // Validate Input
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const {
        first_name, last_name, email, password, phone_number,
        date_of_birth, gender, address, city, linkedin_profile, domain_id
    } = req.body;

    try {
        // Check if user exists
        const userCheck = await db.query('SELECT * FROM candidates WHERE email = $1 OR phone_number = $2', [email, phone_number]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Email or Phone Number already registered.' });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
        const password_hash = await bcrypt.hash(password, salt);

        // Insert User
        const insertQuery = `
            INSERT INTO candidates 
            (first_name, last_name, email, password_hash, phone_number, date_of_birth, gender, address, city, linkedin_profile, domain_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING candidate_id, email, first_name, registered_at
        `;
        
        const values = [
            first_name, 
            last_name, 
            email, 
            password_hash, 
            phone_number,
            date_of_birth || null, 
            gender || null, 
            address || null, 
            city || null, 
            linkedin_profile || null, 
            domain_id || null
        ];

        const result = await db.query(insertQuery, values);
        
        res.status(201).json({
            message: 'Candidate registered successfully.',
            candidate: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

// 3. Candidate Login
exports.loginCandidate = async (req, res) => {
    // Validate Input
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;

    try {
        // Find User
        const result = await db.query('SELECT * FROM candidates WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const candidate = result.rows[0];

        // Check if account is active
        if (!candidate.is_active) {
            return res.status(403).json({ error: 'Account is inactive. Please contact support.' });
        }

        // Compare Password
        const validPass = await bcrypt.compare(password, candidate.password_hash);
        if (!validPass) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        // Create Token
        const token = jwt.sign(
            { candidate_id: candidate.candidate_id, email: candidate.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: candidate.candidate_id,
                first_name: candidate.first_name,
                email: candidate.email
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login.' });
    }
};

// 4. Get Logged In Candidate Details (Me)
exports.getMe = async (req, res) => {
    try {
        // req.user is populated by the auth middleware
        const query = `
            SELECT c.candidate_id, c.first_name, c.last_name, c.email, c.phone_number, 
                   c.date_of_birth, c.gender, c.address, c.city, c.linkedin_profile, 
                   c.registered_at, c.is_active, d.domain_name, d.domain_id
            FROM candidates c
            LEFT JOIN domains d ON c.domain_id = d.domain_id
            WHERE c.candidate_id = $1
        `;
        
        const result = await db.query(query, [req.user.candidate_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Candidate not found.' });
        }

        const user = result.rows[0];

        // Format Dates using date-fns
        // Format: 'dd MMM yyyy' -> 12 Jan 2025
        const formattedUser = {
            ...user,
            date_of_birth: user.date_of_birth 
                ? format(new Date(user.date_of_birth), 'dd MMM yyyy') 
                : null,
            registered_at: user.registered_at 
                ? format(new Date(user.registered_at), 'dd MMM yyyy') 
                : null
        };

        res.status(200).json(formattedUser);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching profile.' });
    }
};