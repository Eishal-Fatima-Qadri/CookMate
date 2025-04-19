const express = require('express');
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
        const result = await pool.request().query('SELECT * FROM Recipes');

        res.setHeader('Content-Type', 'application/json');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error in GET /recipes:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Search recipes
router.get('/search', async (req, res) => {
    try {
        const pool = req.pool;
        const query = req.query.query;
        const searchQuery = `
            SELECT r.*
            FROM Recipes r
            WHERE r.title LIKE '%${query}%'
               OR r.description LIKE '%${query}%'
            UNION
            SELECT DISTINCT r.*
            FROM Recipes r
                     JOIN RecipeIngredients ri ON r.recipe_id = ri.recipe_id
                     JOIN Ingredients i ON ri.ingredient_id = i.ingredient_id
            WHERE i.name LIKE '%${query}%'
        `;

        const result = await pool.request().query(searchQuery);
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
        const recipeId = parseInt(req.params.id);

        // Fetch recipe details
        const recipeQuery = `
            SELECT *
            FROM Recipes
            WHERE recipe_id = ${recipeId}
        `;
        const recipeResult = await pool.request().query(recipeQuery);

        if (recipeResult.recordset.length === 0) {
            return res.status(404).json({status: 'error', message: 'Recipe not found'});
        }

        const recipe = recipeResult.recordset[0];

        // Fetch ingredients for the recipe
        const ingredientsQuery = `
            SELECT i.ingredient_id, i.name, ri.quantity, ri.unit
            FROM Ingredients i
                     JOIN RecipeIngredients ri ON i.ingredient_id = ri.ingredient_id
            WHERE ri.recipe_id = ${recipeId}
        `;
        const ingredientsResult = await pool.request().query(ingredientsQuery);
        recipe.ingredients = ingredientsResult.recordset;

        // Fetch steps for the recipe
        const stepsQuery = `
            SELECT step_number, description
            FROM RecipeSteps
            WHERE recipe_id = ${recipeId}
            ORDER BY step_number ASC;
        `;
        const stepsResult = await pool.request().query(stepsQuery);
        recipe.steps = stepsResult.recordset;

        res.json(recipe);
    } catch (err) {
        console.error('Error in GET /recipes/:id:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Create new recipe
router.post('/', async (req, res) => {
    try {
        const pool = req.pool;
        const {title, description, instructions, cooking_time, difficulty, cuisine_type, created_by} = req.body; // Adjusted to match schema

        const insertQuery = `
            INSERT INTO Recipes (title, description, cooking_time, difficulty, cuisine_type, instructions, created_by,
                                 created_at, updated_at)
            VALUES ('${title}', '${description}', ${cooking_time}, '${difficulty}', '${cuisine_type}', '${instructions}
                    ', ${created_by}, GETDATE(), GETDATE());
            SELECT SCOPE_IDENTITY() AS recipe_id;
        `;

        const result = await pool.request().query(insertQuery);
        const newRecipeId = result.recordset[0].recipe_id;

        res.status(201).json({
            status: 'success',
            message: 'Recipe created successfully',
            recipeId: newRecipeId
        });
    } catch (err) {
        console.error('Error in POST /recipes:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Update recipe
router.put('/:id', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id);
        const {title, description, instructions, cooking_time, difficulty, cuisine_type} = req.body; // Adjusted to match schema

        const updateQuery = `
            UPDATE Recipes
            SET title        = '${title}',
                description  = '${description}',
                instructions = '${instructions}',
                cooking_time = ${cooking_time},
                difficulty   = '${difficulty}',
                cuisine_type = '${cuisine_type}',
                updated_at   = GETDATE()
            WHERE recipe_id = ${recipeId};
        `;

        const result = await pool.request().query(updateQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({status: 'error', message: 'Recipe not found'});
        }

        res.json({
            status: 'success',
            message: 'Recipe updated successfully'
        });
    } catch (err) {
        console.error('Error in PUT /recipes/:id:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Delete recipe
router.delete('/:id', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id);

        // First delete from related tables to maintain referential integrity
        await pool.request().query(`DELETE
                                    FROM RecipeIngredients
                                    WHERE recipe_id = ${recipeId}`);
        await pool.request().query(`DELETE
                                    FROM RecipeSteps
                                    WHERE recipe_id = ${recipeId}`);
        await pool.request().query(`DELETE
                                    FROM Reviews
                                    WHERE recipe_id = ${recipeId}`);
        await pool.request().query(`DELETE
                                    FROM SavedRecipes
                                    WHERE recipe_id = ${recipeId}`);

        const deleteQuery = `DELETE
                             FROM Recipes
                             WHERE recipe_id = ${recipeId}`;
        const result = await pool.request().query(deleteQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({status: 'error', message: 'Recipe not found'});
        }

        res.json({
            status: 'success',
            message: 'Recipe deleted successfully'
        });
    } catch (err) {
        console.error('Error in DELETE /recipes/:id:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Add ingredient to recipe
router.post('/:id/ingredients', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id);
        const {ingredient_id, quantity, unit} = req.body; // Adjusted to match schema

        const insertQuery = `
            INSERT INTO RecipeIngredients (recipe_id, ingredient_id, quantity, unit)
            VALUES (${recipeId}, ${ingredient_id}, ${quantity}, '${unit}')
        `;

        await pool.request().query(insertQuery);

        res.status(201).json({
            status: 'success',
            message: 'Ingredient added to recipe successfully'
        });
    } catch (err) {
        console.error('Error in POST /recipes/:id/ingredients:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Get all ingredients for a recipe (already present and correct)
router.get('/:id/ingredients', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id);

        const query = `
            SELECT i.ingredient_id, i.name, ri.quantity, ri.unit
            FROM Ingredients i
                     JOIN RecipeIngredients ri ON i.ingredient_id = ri.ingredient_id
            WHERE ri.recipe_id = ${recipeId}
        `;

        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error in GET /recipes/:id/ingredients:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Update ingredient in recipe (already present and correct)
router.put('/:recipeId/ingredients/:ingredientId', async (req, res) => {
    try {
        const pool = req.pool;
        const {recipeId, ingredientId} = req.params;
        const {quantity, unit} = req.body;

        const updateQuery = `
            UPDATE RecipeIngredients
            SET quantity = ${quantity},
                unit     = '${unit}'
            WHERE recipe_id = ${recipeId}
              AND ingredient_id = ${ingredientId}
        `;

        const result = await pool.request().query(updateQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({status: 'error', message: 'Ingredient not found in this recipe'});
        }

        res.json({
            status: 'success',
            message: 'Recipe ingredient updated successfully'
        });
    } catch (err) {
        console.error('Error in PUT /recipes/:recipeId/ingredients/:ingredientId:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Remove ingredient from recipe (already present and correct)
router.delete('/:recipeId/ingredients/:ingredientId', async (req, res) => {
    try {
        const pool = req.pool;
        const {recipeId, ingredientId} = req.params;

        const deleteQuery = `
            DELETE
            FROM RecipeIngredients
            WHERE recipe_id = ${recipeId}
              AND ingredient_id = ${ingredientId}
        `;

        const result = await pool.request().query(deleteQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({status: 'error', message: 'Ingredient not found in this recipe'});
        }

        res.json({
            status: 'success',
            message: 'Ingredient removed from recipe successfully'
        });
    } catch (err) {
        console.error('Error in DELETE /recipes/:recipeId/ingredients/:ingredientId:', err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

// Get steps for a specific recipe
router.get('/:id/steps', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id);

        const query = `
            SELECT step_number, description
            FROM RecipeSteps
            WHERE recipe_id = ${recipeId}
            ORDER BY step_number ASC;
        `;

        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(`Error in GET /recipes/${req.params.id}/steps:`, err);
        res.status(500).json({status: 'error', message: 'Server Error', details: err.message});
    }
});

module.exports = router;