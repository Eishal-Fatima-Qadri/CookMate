const express = require('express');
const {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserProfile
} = require('../controllers/userController');
const {protect, admin} = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);

// Protected routes
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

module.exports = router;