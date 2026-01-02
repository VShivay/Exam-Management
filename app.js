const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { format } = require('date-fns');
require('dotenv').config();

// Import Routes
const candidateRoutes = require('./route/candidate/login_route');
const adminRoutes = require('./route/admin/admin_login_route');
const manageCandidateRoutes = require('./route/admin/manage_candidate');
const questionRoutes = require('./route/admin/manage_questions_route');
const manageAcademicRoutes = require('./route/candidate/manage_academic_history_route');
const candidateExamRoutes = require('./route/candidate/candidate_exam_route');

const app = express();

// --- ANSI COLORS ---
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m"
};

// --- LOGGING MIDDLEWARE ---
// Placed at the top to catch everything
app.use((req, res, next) => {
    const start = process.hrtime();
    const timestamp = format(new Date(), 'dd/MM/yyyy-hh:mmaa');
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Log Request
    console.log(`${colors.cyan}[${timestamp}] REQUEST:${colors.reset} ${colors.bright}${req.method}${colors.reset} ${req.originalUrl} | IP: ${ip}`);

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

        // Color logic for status codes
        let statusColor = colors.green;
        if (res.statusCode >= 400) statusColor = colors.yellow;
        if (res.statusCode >= 500) statusColor = colors.red;

        console.log(`${statusColor}[${timestamp}] RESPONSE: ${res.statusCode}${colors.reset} | Duration: ${colors.magenta}${timeInMs}ms${colors.reset}`);
        console.log(`${colors.reset}---`);
    });

    next();
});

// --- GLOBAL MIDDLEWARE ---
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/candidate', candidateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/candidates', manageCandidateRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/candidate/academic-history', manageAcademicRoutes);
app.use('/api/candidate/exam', candidateExamRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('Candidate Portal API is running...');
});

// --- ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
    const timestamp = format(new Date(), 'dd/MM/yyyy-hh:mmaa');
    console.error(`${colors.red}[${timestamp}] ERROR: ${err.message}${colors.reset}`);
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// --- SERVER START ---
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`${colors.bright}${colors.green}====================================${colors.reset}`);
    console.log(`${colors.bright}${colors.green}Server running on port: ${PORT}${colors.reset}`);
    console.log(`${colors.bright}${colors.green}====================================${colors.reset}`);

});
