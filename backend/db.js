// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Add SSL if connecting to cloud DB: 
    ssl: { rejectUnauthorized: false }
});

// Verify connection ONCE at startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('\x1b[31mDatabase connection error:\x1b[0m', err.stack);
    } else {
        console.log('\x1b[32mSuccessfully connected to the PostgreSQL database.\x1b[0m');
    }
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};