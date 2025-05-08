const express = require('express');
const {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    isAdmin,
    getAdminPage
} = require('../controllers/userController');
const {protect, admin} = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/', registerUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/admin', admin, isAdmin, getAdminPage); // Protected admin route


// Protected routes
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

module.exports = router;