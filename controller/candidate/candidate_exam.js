const db = require('../../db');
const Joi = require('joi');

// --- Helper: Joi Schema for Submission ---
const submitSchema = Joi.object({
    answers: Joi.array().items(
        Joi.object({
            question_id: Joi.number().integer().required(),
            selected_option: Joi.string().valid('A', 'B', 'C', 'D').required()
        })
    ).required()
});

/**
 * @desc    Generate Exam (Get 30 Random Questions based on Domain)
 * @route   GET /api/candidate/exam/generate
 * @access  Private (Candidate)
 */
exports.generateExam = async (req, res) => {
    console.log("---------------------------------------------------------");
    console.log("DEBUG: Start Exam Generation Request");

    try {
        // --- STEP 1: DEBUGGING AUTHENTICATION ---
        // Log what the 'auth' middleware attached to req.user
        console.log("DEBUG [Step 1]: req.user content:", JSON.stringify(req.user, null, 2));

        // Attempt to extract ID using common patterns. 
        // This covers cases where middleware puts it in .id, .user_id, or .sub
        const candidateId = req.user?.id || req.user?.candidate_id || req.user?.userId || req.user?.sub;
        console.log("DEBUG [Step 1]: Extracted Candidate ID:", candidateId);

        if (!candidateId) {
            console.error("ERROR: Could not extract an ID from the token.");
            return res.status(401).json({ error: 'Authentication failed: No User ID found in token' });
        }

        // --- STEP 2: CHECK IF EXAM ALREADY TAKEN ---
        console.log("DEBUG [Step 2]: Checking for existing exam results...");
        const checkResultQuery = 'SELECT result_id FROM exam_results WHERE candidate_id = $1 LIMIT 1';
        const checkResult = await db.query(checkResultQuery, [candidateId]);
        
        console.log("DEBUG [Step 2]: Existing results found:", checkResult.rows.length);

        if (checkResult.rows.length > 0) {
            console.warn("WARN: Candidate has already taken the exam.");
            return res.status(403).json({ 
                error: 'Exam already taken.', 
                message: 'You have already attempted this exam.' 
            });
        }

        // --- STEP 3: FETCH CANDIDATE & DOMAIN ---
        console.log("DEBUG [Step 3]: Fetching Candidate Profile from DB...");
        const candidateQuery = 'SELECT candidate_id, domain_id, first_name FROM candidates WHERE candidate_id = $1';
        const candidateRes = await db.query(candidateQuery, [candidateId]);

        console.log("DEBUG [Step 3]: Database Rows Found:", candidateRes.rows.length);

        if (candidateRes.rows.length === 0) {
            console.error(`ERROR: ID ${candidateId} exists in Token but NOT in Database.`);
            console.error(`ACTION REQUIRED: The token is old. Please Logout and Register a new user.`);
            return res.status(404).json({ error: 'Candidate profile not found. Please re-register or contact support.' });
        }

        const candidateData = candidateRes.rows[0];
        const domainId = candidateData.domain_id;
        console.log(`DEBUG [Step 3]: Found Candidate: ${candidateData.first_name}, Domain ID: ${domainId}`);

        if (!domainId) {
            console.error("ERROR: Candidate has NULL domain_id.");
            return res.status(400).json({ error: 'No domain assigned to this candidate. Cannot generate exam.' });
        }

        // --- STEP 4: GENERATE QUESTIONS ---
        console.log("DEBUG [Step 4]: Generating random questions for Domain ID:", domainId);
        
        // Ensure you have questions in your DB for this domain
        const queryText = `
            (SELECT question_id, question_text, option_a, option_b, option_c, option_d, difficulty_level 
             FROM questions 
             WHERE domain_id = $1 AND difficulty_level = 'Easy' 
             ORDER BY RANDOM() LIMIT 15)
            UNION ALL
            (SELECT question_id, question_text, option_a, option_b, option_c, option_d, difficulty_level 
             FROM questions 
             WHERE domain_id = $1 AND difficulty_level = 'Medium' 
             ORDER BY RANDOM() LIMIT 8)
            UNION ALL
            (SELECT question_id, question_text, option_a, option_b, option_c, option_d, difficulty_level 
             FROM questions 
             WHERE domain_id = $1 AND difficulty_level IN ('Hard', 'Expert') 
             ORDER BY RANDOM() LIMIT 7);
        `;

        const questionsRes = await db.query(queryText, [domainId]);
        let questions = questionsRes.rows;

        console.log("DEBUG [Step 4]: Total Questions Fetched:", questions.length);

        if (questions.length === 0) {
            console.warn("WARN: No questions found for this domain.");
            return res.status(404).json({ error: 'No questions available for your domain yet.' });
        }

        // --- STEP 5: SHUFFLE & RESPOND ---
        questions = questions.sort(() => Math.random() - 0.5);

        const totalQuestions = questions.length;
        const pageSize = 10;
        const totalPages = Math.ceil(totalQuestions / pageSize);
        
        const paginatedData = {};
        for (let i = 0; i < totalPages; i++) {
            paginatedData[`page_${i + 1}`] = questions.slice(i * pageSize, (i + 1) * pageSize);
        }

        console.log("DEBUG [Step 5]: Success! Sending response.");
        console.log("---------------------------------------------------------");

        res.status(200).json({
            message: 'Exam generated successfully',
            exam_meta: {
                total_questions: totalQuestions,
                duration_minutes: 30,
                domain_id: domainId,
                total_pages: totalPages
            },
            questions_flat: questions,
            questions_paginated: paginatedData
        });

    } catch (err) {
        console.error('CRITICAL ERROR in generateExam:', err);
        res.status(500).json({ error: 'Server error generating exam', details: err.message });
    }
};

/**
 * @desc    Submit Exam and Calculate Result
 * @route   POST /api/candidate/exam/submit
 * @access  Private (Candidate)
 */
exports.submitExam = async (req, res) => {
    try {
        const candidateId = req.user.id || req.user.candidate_id;
        
        // Check Double Submission
        const checkResultQuery = 'SELECT result_id FROM exam_results WHERE candidate_id = $1 LIMIT 1';
        const checkResult = await db.query(checkResultQuery, [candidateId]);
        if (checkResult.rows.length > 0) {
            return res.status(403).json({ error: 'Exam already submitted.' });
        }

        // Validate Input
        const { error } = submitSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { answers } = req.body; 

        if (answers.length === 0) {
             return res.status(400).json({ error: "No answers submitted" });
        }

        // Get Domain
        const candidateRes = await db.query('SELECT domain_id FROM candidates WHERE candidate_id = $1', [candidateId]);
        const domainId = candidateRes.rows[0]?.domain_id;

        // Evaluate
        const questionIds = answers.map(a => a.question_id);
        
        const correctOptionsRes = await db.query(
            'SELECT question_id, correct_option FROM questions WHERE question_id = ANY($1::int[])',
            [questionIds]
        );

        const correctMap = {};
        correctOptionsRes.rows.forEach(row => {
            correctMap[row.question_id] = row.correct_option;
        });

        let correctCount = 0;
        let wrongCount = 0;
        
        answers.forEach(ans => {
            const correctOpt = correctMap[ans.question_id];
            if (correctOpt) {
                if (ans.selected_option === correctOpt) {
                    correctCount++;
                } else {
                    wrongCount++;
                }
            }
        });

        const totalQuestions = answers.length; 
        
        // Calculate Score
        const rawScore = (correctCount / totalQuestions) * 100;
        const scoreObtained = parseFloat(rawScore.toFixed(2));
        const status = scoreObtained >= 60 ? 'Pass' : 'Fail';

        // Save Result
        const insertQuery = `
            INSERT INTO exam_results 
            (candidate_id, domain_id, total_questions, correct_answers, wrong_answers, score_obtained, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING result_id, exam_date;
        `;

        const resultDb = await db.query(insertQuery, [
            candidateId,
            domainId,
            totalQuestions,
            correctCount,
            wrongCount,
            scoreObtained,
            status
        ]);

        const savedResult = resultDb.rows[0];

        res.status(201).json({
            message: 'Exam submitted successfully',
            result: {
                result_id: savedResult.result_id,
                exam_date: savedResult.exam_date,
                total_questions: totalQuestions,
                correct_answers: correctCount,
                wrong_answers: wrongCount,
                score: scoreObtained,
                status: status
            }
        });

    } catch (err) {
        console.error('Error submitting exam:', err);
        res.status(500).json({ error: 'Server error submitting exam' });
    }
};
/**
 * @desc    Get Exam Result (if exists)
 * @route   GET /api/candidate/exam/result
 * @access  Private
 */
exports.getExamResult = async (req, res) => {
    try {
        const candidateId = req.user.id || req.user.candidate_id;

        const query = `
            SELECT result_id, score_obtained, status, exam_date, total_questions, correct_answers, wrong_answers 
            FROM exam_results 
            WHERE candidate_id = $1 
            LIMIT 1
        `;
        const result = await db.query(query, [candidateId]);

        if (result.rows.length === 0) {
            // It's not an error, just means they haven't taken it yet
            return res.status(200).json({ taken: false });
        }

        res.status(200).json({ 
            taken: true, 
            data: result.rows[0] 
        });

    } catch (err) {
        console.error('Error fetching result:', err);
        res.status(500).json({ error: 'Server error fetching result' });
    }
};