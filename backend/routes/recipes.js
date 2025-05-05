const express = require('express');
const {sql} = require("../config/db");
const router = express.Router();

// Test endpoint to verify API connectivity
router.get('/test', async (req, res) => {
    try {
        res.json({status: 'success', message: 'API is working correctly'});
    } catch (err) {
        console.error(err);
        res.status(500).json({status: 'error', message: 'Server Error'});
    }
});

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const pool = req.pool;
        const request = pool.request();
        const result = await request.query('SELECT * FROM Recipes');

        res.setHeader('Content-Type', 'application/json');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error in GET /recipes:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Search recipes
router.get('/search', async (req, res) => {
    try {
        const pool = req.pool;
        const {query: q} = req.query;

        const searchQuery = `
            SELECT r.*
            FROM Recipes r
            WHERE r.title LIKE @query
               OR r.description LIKE @query
            UNION
            SELECT DISTINCT r.*
            FROM Recipes r
                     JOIN RecipeIngredients ri ON r.recipe_id = ri.recipe_id
                     JOIN Ingredients i ON ri.ingredient_id = i.ingredient_id
            WHERE i.name LIKE @query
        `;

        const request = pool.request();
        request.input('query', sql.VarChar, `%${q}%`);
        const result = await request.query(searchQuery);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error in GET /recipes/search:', err);
        res.status(500).json({status: 'error', message: err.message});
    }
});

// Get recipe by ID with ingredients and steps
router.get('/:id', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id, 10);

        // Fetch recipe
        const requestRecipe = pool.request();
        requestRecipe.input('recipeId', sql.Int, recipeId);
        const {recordset: recipes} = await requestRecipe.query(
            `SELECT *
             FROM Recipes
             WHERE recipe_id = @recipeId`
        );

        if (!recipes.length) {
            return res.status(404).json({
                status: 'error',
                message: 'Recipe not found'
            });
        }
        const recipe = recipes[0];

        // Fetch ingredients
        const requestIng = pool.request();
        requestIng.input('recipeId', sql.Int, recipeId);
        const {recordset: ingredients} = await requestIng.query(
            `
                SELECT i.ingredient_id, i.name, ri.quantity, ri.unit
                FROM Ingredients i
                         JOIN RecipeIngredients ri
                              ON i.ingredient_id = ri.ingredient_id
                WHERE ri.recipe_id = @recipeId
            `
        );
        recipe.ingredients = ingredients;

        // Fetch steps
        const requestSteps = pool.request();
        requestSteps.input('recipeId', sql.Int, recipeId);
        const {recordset: steps} = await requestSteps.query(
            `
                SELECT step_number, description
                FROM RecipeSteps
                WHERE recipe_id = @recipeId
                ORDER BY step_number
            `
        );
        recipe.steps = steps;

        res.json(recipe);
    } catch (err) {
        console.error('Error in GET /recipes/:id:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Create new recipe
router.post('/', async (req, res) => {
    try {
        const pool = req.pool;
        const {
            title,
            description = '',
            instructions,
            cooking_time,
            difficulty,
            cuisine_type,
            created_by = 1,
        } = req.body;

        const insertQuery = `
            INSERT INTO Recipes (title, description, cooking_time, difficulty,
                                 cuisine_type, instructions, created_by,
                                 created_at, updated_at)
            VALUES (@title, @description, @cooking_time, @difficulty,
                    @cuisine_type, @instructions, @created_by, GETDATE(),
                    GETDATE());
            SELECT SCOPE_IDENTITY() as recipe_id;
        `;

        const request = pool.request();
        request.input('title', sql.VarChar, title);
        request.input('description', sql.VarChar, description);
        request.input('cooking_time', sql.Int, cooking_time);
        request.input('difficulty', sql.VarChar, difficulty);
        request.input('cuisine_type', sql.VarChar, cuisine_type);
        request.input('instructions', sql.VarChar, instructions);
        request.input('created_by', sql.Int, created_by);

        const {recordset} = await request.query(insertQuery);
        const newId = recordset[0].recipe_id;

        res.status(201).json({
            status: 'success',
            message: 'Recipe created successfully',
            recipe_id: newId
        });
    } catch (err) {
        console.error('Error in POST /recipes:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Update recipe
router.put('/:id', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id, 10);
        const {
            title,
            description = '',
            instructions,
            cooking_time,
            difficulty,
            cuisine_type
        } = req.body;

        const updateQuery = `
            UPDATE Recipes
            SET title        = @title,
                description  = @description,
                instructions = @instructions,
                cooking_time = @cooking_time,
                difficulty   = @difficulty,
                cuisine_type = @cuisine_type,
                updated_at   = GETDATE()
            WHERE recipe_id = @recipeId;
        `;

        const request = pool.request();
        request.input('title', sql.VarChar, title);
        request.input('description', sql.VarChar, description);
        request.input('instructions', sql.VarChar, instructions);
        request.input('cooking_time', sql.Int, cooking_time);
        request.input('difficulty', sql.VarChar, difficulty);
        request.input('cuisine_type', sql.VarChar, cuisine_type);
        request.input('recipeId', sql.Int, recipeId);

        const result = await request.query(updateQuery);
        if (!result.rowsAffected[0]) {
            return res.status(404).json({
                status: 'error',
                message: 'Recipe not found'
            });
        }

        res.json({status: 'success', message: 'Recipe updated successfully'});
    } catch (err) {
        console.error('Error in PUT /recipes/:id:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Delete recipe & related records
router.delete('/:id', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id, 10);

        const request = pool.request();
        request.input('recipeId', sql.Int, recipeId);

        const deleteRelated = [
            'DELETE FROM RecipeIngredients WHERE recipe_id = @recipeId',
            'DELETE FROM RecipeSteps WHERE recipe_id = @recipeId',
            'DELETE FROM Reviews WHERE recipe_id = @recipeId',
            'DELETE FROM SavedRecipes WHERE recipe_id = @recipeId',
        ];
        for (const q of deleteRelated) {
            await request.query(q);
        }

        const deleteMain = await request.query('DELETE FROM Recipes WHERE recipe_id = @recipeId');
        if (!deleteMain.rowsAffected[0]) {
            return res.status(404).json({
                status: 'error',
                message: 'Recipe not found'
            });
        }

        res.json({status: 'success', message: 'Recipe deleted successfully'});
    } catch (err) {
        console.error('Error in DELETE /recipes/:id:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Ingredients endpoints
router.post('/:id/ingredients', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id, 10);
        const {ingredient_id, quantity, unit} = req.body;

        const insertQuery = 'INSERT INTO RecipeIngredients (recipe_id, ingredient_id, quantity, unit) VALUES (@recipeId, @ingredientId, @quantity, @unit)';
        const request = pool.request();
        request.input('recipeId', sql.Int, recipeId);
        request.input('ingredientId', sql.Int, ingredient_id);
        request.input('quantity', sql.Decimal, quantity);
        request.input('unit', sql.VarChar, unit);
        await request.query(insertQuery);

        res.status(201).json({
            status: 'success',
            message: 'Ingredient added to recipe successfully'
        });
    } catch (err) {
        console.error('Error in POST /recipes/:id/ingredients:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

router.get('/:id/ingredients', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id, 10);

        const query = `
            SELECT i.ingredient_id, i.name, ri.quantity, ri.unit
            FROM Ingredients i
                     JOIN RecipeIngredients ri
                          ON i.ingredient_id = ri.ingredient_id
            WHERE ri.recipe_id = @recipeId
        `;
        const request = pool.request();
        request.input('recipeId', sql.Int, recipeId);
        const {recordset} = await request.query(query);

        res.json(recordset);
    } catch (err) {
        console.error('Error in GET /recipes/:id/ingredients:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

router.put('/:recipeId/ingredients/:ingredientId', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.recipeId, 10);
        const ingredientId = parseInt(req.params.ingredientId, 10);
        const {quantity, unit} = req.body;

        const updateQuery = `
            UPDATE RecipeIngredients
            SET quantity = @quantity,
                unit     = @unit
            WHERE recipe_id = @recipeId
              AND ingredient_id = @ingredientId
        `;
        const request = pool.request();
        request.input('quantity', sql.Decimal, quantity);
        request.input('unit', sql.VarChar, unit);
        request.input('recipeId', sql.Int, recipeId);
        request.input('ingredientId', sql.Int, ingredientId);

        const result = await request.query(updateQuery);
        if (!result.rowsAffected[0]) {
            return res.status(404).json({
                status: 'error',
                message: 'Ingredient not found in this recipe'
            });
        }

        res.json({
            status: 'success',
            message: 'Recipe ingredient updated successfully'
        });
    } catch (err) {
        console.error('Error in PUT /recipes/:recipeId/ingredients/:ingredientId:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

router.delete('/:recipeId/ingredients/:ingredientId', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.recipeId, 10);
        const ingredientId = parseInt(req.params.ingredientId, 10);

        const deleteQuery = `
            DELETE
            FROM RecipeIngredients
            WHERE recipe_id = @recipeId
              AND ingredient_id = @ingredientId
        `;
        const request = pool.request();
        request.input('recipeId', sql.Int, recipeId);
        request.input('ingredientId', sql.Int, ingredientId);
        const result = await request.query(deleteQuery);

        if (!result.rowsAffected[0]) {
            return res.status(404).json({
                status: 'error',
                message: 'Ingredient not found in this recipe'
            });
        }

        res.json({
            status: 'success',
            message: 'Ingredient removed from recipe successfully'
        });
    } catch (err) {
        console.error('Error in DELETE /recipes/:recipeId/ingredients/:ingredientId:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Get steps for a specific recipe
router.get('/:id/steps', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id, 10);

        const query = `
            SELECT step_number, description
            FROM RecipeSteps
            WHERE recipe_id = @recipeId
            ORDER BY step_number
        `;
        const request = pool.request();
        request.input('recipeId', sql.Int, recipeId);
        const {recordset} = await request.query(query);

        res.json(recordset);
    } catch (err) {
        console.error(`Error in GET /recipes/${req.params.id}/steps:`, err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

module.exports = router;