const pool = require('../../db'); // Assuming you use pg pool
const Joi = require('joi');

// Helper to get date ranges
const getDateRange = (filter) => {
    const now = new Date();
    let startDate = new Date();

    switch (filter) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'last_week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'last_month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'last_year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            return null;
    }
    return startDate;
};

exports.getExamResults = async (req, res) => {
    try {
        const { domain, student_name, date_filter, start_date, end_date } = req.query;

        let query = `
            SELECT er.*, c.first_name, c.last_name, d.domain_name 
            FROM exam_results er
            JOIN candidates c ON er.candidate_id = c.candidate_id
            LEFT JOIN domains d ON er.domain_id = d.domain_id
            WHERE 1=1
        `;
        const values = [];

        if (domain) {
            values.push(domain);
            query += ` AND d.domain_name = $${values.length}`;
        }

        if (student_name) {
            values.push(`%${student_name}%`);
            query += ` AND (c.first_name ILIKE $${values.length} OR c.last_name ILIKE $${values.length})`;
        }

        // Date Filtering Logic
        if (date_filter === 'custom' && start_date && end_date) {
            values.push(start_date, end_date);
            query += ` AND er.exam_date BETWEEN $${values.length - 1} AND $${values.length}`;
        } else if (date_filter) {
            const rangeStart = getDateRange(date_filter);
            if (rangeStart) {
                values.push(rangeStart);
                query += ` AND er.exam_date >= $${values.length}`;
            }
        }

        const results = await pool.query(query, values);
        res.status(200).json({ success: true, data: results.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getExamDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT er.*, c.first_name, c.last_name, c.email, d.domain_name 
            FROM exam_results er
            JOIN candidates c ON er.candidate_id = c.candidate_id
            JOIN domains d ON er.domain_id = d.domain_id
            WHERE er.result_id = $1
        `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Result not found" });
        }

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteExamResult = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM exam_results WHERE result_id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Result not found" });
        }

        res.status(200).json({ success: true, message: "Result deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};