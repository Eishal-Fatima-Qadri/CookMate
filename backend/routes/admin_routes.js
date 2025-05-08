// routes/adminRoutes.js
const express = require('express');
const { sql } = require('../config/db');
const router = express.Router();
const { isAdmin } = require('../controllers/userController');

// Middleware to check if user is authenticated and is an admin
router.use(isAdmin);

// Get system stats
router.get('/stats', async (req, res) => {
    try {
        const pool = req.pool;
        
        // Get total users
        const usersResult = await pool.request().query('SELECT COUNT(*) as count FROM Users');
        const totalUsers = usersResult.recordset[0].count;
        
        // Get total recipes
        const recipesResult = await pool.request().query('SELECT COUNT(*) as count FROM Recipes');
        const totalRecipes = recipesResult.recordset[0].count;
        
        // Get pending recipes
        const pendingResult = await pool.request()
            .query("SELECT COUNT(*) as count FROM Recipes WHERE status = 'pending'");
        const pendingRecipes = pendingResult.recordset[0].count;
        
        // Get total ingredients
        const ingredientsResult = await pool.request().query('SELECT COUNT(*) as count FROM Ingredients');
        const totalIngredients = ingredientsResult.recordset[0].count;
        
        // Get new users this week
        const newUsersResult = await pool.request()
            .query(`
                SELECT COUNT(*) as count 
                FROM Users 
                WHERE created_at >= DATEADD(day, -7, GETDATE())
            `);
        const newUsersThisWeek = newUsersResult.recordset[0].count;
        
        // Get active users today (assuming there's a login_history or activity table)
        // Since we don't have this table yet, we'll return 0
        const activeToday = 0;
        
        res.json({
            totalUsers,
            totalRecipes,
            pendingRecipes,
            totalIngredients,
            newUsersThisWeek,
            activeToday
        });
        
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get popular recipes (most viewed or highest rated)
router.get('/popular-recipes', async (req, res) => {
    try {
        const pool = req.pool;
        
        // If you had a views or ratings field, you would sort by that
        // For now, we'll just get the most recent recipes
        const result = await pool.request()
            .query(`
                SELECT TOP 5 recipe_id, title, created_at, updated_at
                FROM Recipes
                WHERE status = 'approved'
                ORDER BY created_at DESC
            `);
        
        // Add some placeholder views and ratings data
        const recipes = result.recordset.map(recipe => ({
            id: recipe.recipe_id,
            title: recipe.title,
            views: Math.floor(Math.random() * 300) + 100,
            rating: (Math.random() * 2 + 3).toFixed(1)
        }));
        
        res.json(recipes);
        
    } catch (error) {
        console.error('Error fetching popular recipes:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get pending recipes
router.get('/pending-recipes', async (req, res) => {
    try {
        const pool = req.pool;
        
        const result = await pool.request()
            .query(`
                SELECT r.recipe_id, r.title, r.created_at, u.username as creator
                FROM Recipes r
                LEFT JOIN Users u ON r.created_by = u.user_id
                WHERE r.status = 'pending'
                ORDER BY r.created_at DESC
            `);
        
        res.json(result.recordset);
        
    } catch (error) {
        console.error('Error fetching pending recipes:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get recent user activity
router.get('/user-activities', async (req, res) => {
    try {
        // In a real app, you'd have a user_activity or audit_log table
        // For now, we'll generate some mock data
        
        // Get some recent recipes to base activity on
        const pool = req.pool;
        const recipesResult = await pool.request()
            .query(`
                SELECT TOP 5 r.recipe_id, r.title, r.created_at, u.username
                FROM Recipes r
                LEFT JOIN Users u ON r.created_by = u.user_id
                ORDER BY r.created_at DESC
            `);
        
        const activities = recipesResult.recordset.map((recipe, index) => ({
            id: `recipe-${recipe.recipe_id}`,
            user: recipe.username || `user_${recipe.recipe_id}`,
            action: "added a new recipe",
            item: recipe.title,
            time: getRelativeTime(new Date(recipe.created_at))
        }));
        
        res.json(activities);
        
    } catch (error) {
        console.error('Error fetching user activities:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Helper function to format relative time
function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 60) {
        return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

module.exports = router;