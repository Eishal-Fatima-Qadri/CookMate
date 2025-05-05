const express = require('express');
const router = express.Router();

// Test endpoint
router.get('/test', async (req, res) => {
    try {
        res.json({
            status: 'success',
            message: 'Ingredients API is working correctly'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({status: 'error', message: 'Server Error'});
    }
});

// Get all ingredients
router.get('/', async (req, res) => {
    try {
        const pool = req.pool;
        const result = await pool.request().query('SELECT * FROM Ingredients ORDER BY name');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error in GET /ingredients:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Get ingredient by ID
router.get('/:id', async (req, res) => {
    try {
        const pool = req.pool;
        const ingredientId = parseInt(req.params.id);

        const result = await pool.request()
            .input('ingredientId', ingredientId)
            .query('SELECT * FROM Ingredients WHERE ingredient_id = @ingredientId');

        if (result.recordset.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Ingredient not found'
            });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error in GET /ingredients/:id:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Create new ingredient
router.post('/', async (req, res) => {
    try {
        const pool = req.pool;
        const {name, nutritional_info = ''} = req.body;

        const result = await pool.request()
            .input('name', name)
            .input('nutritional_info', nutritional_info)
            .query(`
                INSERT INTO Ingredients (name, nutritional_info)
                VALUES (@name, @nutritional_info);
                SELECT SCOPE_IDENTITY() AS ingredient_id;
            `);

        const newIngredientId = result.recordset[0].ingredient_id;

        res.status(201).json({
            status: 'success',
            message: 'Ingredient created successfully',
            ingredientId: newIngredientId
        });
    } catch (err) {
        console.error('Error in POST /ingredients:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Update ingredient
router.put('/:id', async (req, res) => {
    try {
        const pool = req.pool;
        const ingredientId = parseInt(req.params.id);
        const {name, nutritional_info = ''} = req.body;

        const result = await pool.request()
            .input('ingredientId', ingredientId)
            .input('name', name)
            .input('nutritional_info', nutritional_info)
            .query(`
                UPDATE Ingredients
                SET name = @name,
                    nutritional_info = @nutritional_info
                WHERE ingredient_id = @ingredientId
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Ingredient not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Ingredient updated successfully'
        });
    } catch (err) {
        console.error('Error in PUT /ingredients/:id:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Delete ingredient
router.delete('/:id', async (req, res) => {
    try {
        const pool = req.pool;
        const ingredientId = parseInt(req.params.id);

        const checkResult = await pool.request()
            .input('ingredientId', ingredientId)
            .query(`SELECT COUNT(*) AS count
                    FROM RecipeIngredients
                    WHERE ingredient_id = @ingredientId`);

        if (checkResult.recordset[0].count > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot delete ingredient because it is used in one or more recipes'
            });
        }

        const checkPantryResult = await pool.request()
            .input('ingredientId', ingredientId)
            .query(`SELECT COUNT(*) AS count
                    FROM UserPantry
                    WHERE ingredient_id = @ingredientId`);

        if (checkPantryResult.recordset[0].count > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot delete ingredient because it is in one or more user pantries'
            });
        }

        const deleteResult = await pool.request()
            .input('ingredientId', ingredientId)
            .query('DELETE FROM Ingredients WHERE ingredient_id = @ingredientId');

        if (deleteResult.rowsAffected[0] === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Ingredient not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Ingredient deleted successfully'
        });
    } catch (err) {
        console.error('Error in DELETE /ingredients/:id:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Search ingredients
router.get('/search/:query', async (req, res) => {
    try {
        const pool = req.pool;
        const searchQuery = `%${req.params.query}%`;

        const result = await pool.request()
            .input('searchQuery', searchQuery)
            .query('SELECT * FROM Ingredients WHERE name LIKE @searchQuery ORDER BY name');

        res.json(result.recordset);
    } catch (err) {
        console.error('Error in GET /ingredients/search/:query:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

module.exports = router;
