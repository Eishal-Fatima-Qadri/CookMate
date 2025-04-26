const express = require('express');
const router = express.Router();

// Test endpoint to verify API connectivity
router.get('/test', async (req, res) => {
    try {
        res.json({status: 'success', message: 'Ingredients API is working correctly'});
    } catch (err) {
        console.error(err);
        res.status(500).json({status: 'error', message: 'Server Error'});
    }
});

// Get all ingredients
router.get('/', async (req, res) => {
    try {
        const pool = req.pool;
        const result = await pool.request().query('SELECT * FROM Ingredients ORDER BY name ');

        res.json(result.recordset);
    } catch (err) {
        console.error('Error in GET /ingredients:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Get ingredient by ID
router.get('/:id', async (req, res) => {
    try {
        const pool = req.pool;
        const ingredientId = parseInt(req.params.id);

        const query = `
            SELECT *
            FROM Ingredients
            WHERE ingredient_id = ${ingredientId}
        `;
        const result = await pool.request().query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({status: 'error', message: 'Ingredient not found'});
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error in GET /ingredients/:id:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Create new ingredient
router.post('/', async (req, res) => {
    try {
        const pool = req.pool;
        const {name, nutritional_info} = req.body;

        const insertQuery = `
            INSERT INTO Ingredients (name, nutritional_info)
            VALUES ('${name}', '${nutritional_info || ''}');
            SELECT SCOPE_IDENTITY() AS ingredient_id;
        `;

        const result = await pool.request().query(insertQuery);
        const newIngredientId = result.recordset[0].ingredient_id;

        res.status(201).json({
            status: 'success',
            message: 'Ingredient created successfully',
            ingredientId: newIngredientId
        });
    } catch (err) {
        console.error('Error in POST /ingredients:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Update ingredient
router.put('/:id', async (req, res) => {
    try {
        const pool = req.pool;
        const ingredientId = parseInt(req.params.id);
        const {name, nutritional_info} = req.body;

        const updateQuery = `
            UPDATE Ingredients
            SET name             = '${name}',
                nutritional_info = '${nutritional_info || ''}'
            WHERE ingredient_id = ${ingredientId};
        `;

        const result = await pool.request().query(updateQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({status: 'error', message: 'Ingredient not found'});
        }

        res.json({
            status: 'success',
            message: 'Ingredient updated successfully'
        });
    } catch (err) {
        console.error('Error in PUT /ingredients/:id:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Delete ingredient
router.delete('/:id', async (req, res) => {
    try {
        const pool = req.pool;
        const ingredientId = parseInt(req.params.id);

        // Check if the ingredient is used in any recipes
        const checkQuery = `
            SELECT COUNT(*) AS count
            FROM RecipeIngredients
            WHERE ingredient_id = ${ingredientId}
        `;
        const checkResult = await pool.request().query(checkQuery);

        if (checkResult.recordset[0].count > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot delete ingredient because it is used in one or more recipes'
            });
        }

        // Also check UserPantry
        const checkPantryQuery = `
            SELECT COUNT(*) AS count
            FROM UserPantry
            WHERE ingredient_id = ${ingredientId}
        `;
        const checkPantryResult = await pool.request().query(checkPantryQuery);

        if (checkPantryResult.recordset[0].count > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot delete ingredient because it is in one or more user pantries'
            });
        }

        const deleteQuery = `
            DELETE
            FROM Ingredients
            WHERE ingredient_id = ${ingredientId}
        `;

        const result = await pool.request().query(deleteQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({status: 'error', message: 'Ingredient not found'});
        }

        res.json({
            status: 'success',
            message: 'Ingredient deleted successfully'
        });
    } catch (err) {
        console.error('Error in DELETE /ingredients/:id:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Search ingredients
router.get('/search/:query', async (req, res) => {
    try {
        const pool = req.pool;
        const searchQuery = req.params.query;

        const query = `
            SELECT *
            FROM Ingredients
            WHERE name LIKE '%${searchQuery}%'
            ORDER BY name
        `;

        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error in GET /ingredients/search/:query:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

module.exports = router;