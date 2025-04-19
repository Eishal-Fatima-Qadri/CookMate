const bcrypt = require('bcryptjs');
const {sql} = require('../config/db');
const generateToken = require('../utils/generateToken');
const requireAuth = require('../middleware/authMiddleware'); // Assuming you have an auth middleware

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({message: 'Please provide email and password'});
        }

        const pool = req.pool;
        const query = `
            SELECT user_id, username, email, password, role
            FROM Users
            WHERE email = @email
        `;

        const result = await pool.request()
            .input('email', sql.VarChar(100), email)
            .query(query);

        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(password, user.password, isMatch);

        if (!isMatch) {
            return res.status(401).json({message: 'Invalid email or password'});
        }

        res.json({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user.user_id)
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({message: 'Server Error'});
    }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        const {username, email, password, dietary_preferences = '', allergens = '', favorite_cuisines = ''} = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({message: 'Please provide all required fields'});
        }

        const pool = req.pool;
        const userCheck = await pool.request()
            .input('email', sql.VarChar(100), email)
            .query('SELECT email FROM Users WHERE email = @email');

        if (userCheck.recordset.length > 0) {
            return res.status(400).json({message: 'User already exists'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const insertQuery = `
            INSERT INTO Users (username, email, password, role, dietary_preferences, allergens, favorite_cuisines,
                               created_at)
            OUTPUT INSERTED.user_id,
                   INSERTED.username,
                   INSERTED.email,
                   INSERTED.role
            VALUES (@username, @email, @password, @role, @dietary_preferences, @allergens, @favorite_cuisines,
                    GETDATE())
        `;

        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .input('email', sql.VarChar(100), email)
            .input('password', sql.VarChar(255), hashedPassword)
            .input('role', sql.VarChar(10), 'user') // Default role
            .input('dietary_preferences', sql.VarChar(255), dietary_preferences)
            .input('allergens', sql.VarChar(255), allergens)
            .input('favorite_cuisines', sql.VarChar(255), favorite_cuisines)
            .query(insertQuery);

        if (result.recordset && result.recordset[0]) {
            const newUser = result.recordset[0];

            res.status(201).json({
                user_id: newUser.user_id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                token: generateToken(newUser.user_id)
            });
        } else {
            res.status(400).json({message: 'Invalid user data'});
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({message: 'Server Error'});
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const pool = req.pool;
        const result = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .query(`
                SELECT user_id, username, email, role, dietary_preferences, allergens, favorite_cuisines
                FROM Users
                WHERE user_id = @userId
            `);

        const user = result.recordset[0];

        if (user) {
            res.json({
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role,
                dietary_preferences: user.dietary_preferences,
                allergens: user.allergens,
                favorite_cuisines: user.favorite_cuisines
            });
        } else {
            res.status(404).json({message: 'User not found'});
        }

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({message: 'Server Error'});
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const {username, email, password, dietary_preferences, allergens, favorite_cuisines} = req.body;

        const pool = req.pool;

        const userResult = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .query('SELECT * FROM Users WHERE user_id = @userId');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({message: 'User not found'});
        }

        let updateQuery = 'UPDATE Users SET ';
        const updateFields = [];
        const request = pool.request()
            .input('userId', sql.Int, req.user.id);

        if (username) {
            updateFields.push('username = @username');
            request.input('username', sql.VarChar(50), username);
        }

        if (email) {
            updateFields.push('email = @email');
            request.input('email', sql.VarChar(100), email);
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.push('password = @password');
            request.input('password', sql.VarChar(255), hashedPassword);
        }

        if (dietary_preferences !== undefined) {
            updateFields.push('dietary_preferences = @dietary_preferences');
            request.input('dietary_preferences', sql.VarChar(255), dietary_preferences);
        }

        if (allergens !== undefined) {
            updateFields.push('allergens = @allergens');
            request.input('allergens', sql.VarChar(255), allergens);
        }

        if (favorite_cuisines !== undefined) {
            updateFields.push('favorite_cuisines = @favorite_cuisines');
            request.input('favorite_cuisines', sql.VarChar(255), favorite_cuisines);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({message: 'No fields to update'});
        }

        updateQuery += updateFields.join(', ');
        updateQuery += ' OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.email, INSERTED.role, INSERTED.dietary_preferences, INSERTED.allergens, INSERTED.favorite_cuisines WHERE user_id = @userId';

        const result = await request.query(updateQuery);

        if (result.recordset && result.recordset[0]) {
            const updatedUser = result.recordset[0];

            res.json({
                user_id: updatedUser.user_id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                dietary_preferences: updatedUser.dietary_preferences,
                allergens: updatedUser.allergens,
                favorite_cuisines: updatedUser.favorite_cuisines
            });
        } else {
            res.status(500).json({message: 'Update failed'});
        }

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({message: 'Server Error'});
    }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({message: 'Not authorized as an admin'});
    }
};

// @desc    Get blank admin page (requires admin role)
// @route   GET /api/admin
// @access  Private (Admin only)
const getAdminPage = (req, res) => {
    res.json({message: 'Welcome to the Admin Page!'}); // You can render an HTML page here if needed
};

module.exports = {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    isAdmin,
    getAdminPage
};