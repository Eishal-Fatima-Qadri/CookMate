const jwt = require('jsonwebtoken');
const {sql} = require('../config/db');

const protect = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database (excluding password)
            const pool = req.pool;
            const result = await pool.request()
                .input('userId', sql.Int, decoded.id)
                .query(`
                    SELECT user_id, username, email, role
                    FROM Users
                    WHERE user_id = @userId
                `);

            // If user found, attach to request object
            if (result.recordset.length > 0) {
                req.user = {
                    id: result.recordset[0].user_id,
                    username: result.recordset[0].username,
                    email: result.recordset[0].email,
                    role: result.recordset[0].role
                };
                next();
            } else {
                res.status(401).json({message: 'Not authorized, user not found'});
            }
        } catch (error) {
            console.error('Auth middleware error:', error);
            res.status(401).json({message: 'Not authorized, token failed'});
        }
    } else {
        res.status(401).json({message: 'Not authorized, no token'});
    }
};

// Admin route protection
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({message: 'Not authorized as admin'});
    }
};

module.exports = {protect, admin};