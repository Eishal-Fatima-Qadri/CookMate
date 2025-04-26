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
        const query = req.query.query;

        // Using parameterized query to prevent SQL injection
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
        request.input('query', `%${query}%`);
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
        const recipeId = parseInt(req.params.id);

        // Using parameterized query
        const recipeQuery = `
            SELECT *
            FROM Recipes
            WHERE recipe_id = @recipeId
        `;

        const request = pool.request();
        request.input('recipeId', recipeId);
        const recipeResult = await request.query(recipeQuery);

        if (recipeResult.recordset.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Recipe not found'
            });
        }

        const recipe = recipeResult.recordset[0];

        // Fetch ingredients for the recipe
        const ingredientsQuery = `
            SELECT i.ingredient_id, i.name, ri.quantity, ri.unit
            FROM Ingredients i
                     JOIN RecipeIngredients ri ON i.ingredient_id = ri.ingredient_id
            WHERE ri.recipe_id = @recipeId
        `;

        const ingredientsRequest = pool.request();
        ingredientsRequest.input('recipeId', recipeId);
        const ingredientsResult = await ingredientsRequest.query(ingredientsQuery);
        recipe.ingredients = ingredientsResult.recordset;

        // Fetch steps for the recipe
        const stepsQuery = `
            SELECT step_number, description
            FROM RecipeSteps
            WHERE recipe_id = @recipeId
            ORDER BY step_number;
        `;

        const stepsRequest = pool.request();
        stepsRequest.input('recipeId', recipeId);
        const stepsResult = await stepsRequest.query(stepsQuery);
        recipe.steps = stepsResult.recordset;

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
            description,
            instructions,
            cooking_time,
            difficulty,
            cuisine_type,
            created_by = 1
        } = req.body;

        // Using parameterized query to prevent SQL injection and handle string escaping properly
        const insertQuery = `
            INSERT INTO Recipes (title, description, cooking_time, difficulty,
                                 cuisine_type, instructions, created_by,
                                 created_at, updated_at)
            VALUES (@title, @description, @cooking_time, @difficulty,
                    @cuisine_type, @instructions, @created_by,
                    GETDATE(), GETDATE());
            SELECT SCOPE_IDENTITY() AS recipe_id;
        `;

        const request = pool.request();
        request.input('title', title);
        request.input('description', description || '');
        request.input('cooking_time', cooking_time);
        request.input('difficulty', difficulty);
        request.input('cuisine_type', cuisine_type);
        request.input('instructions', instructions);
        request.input('created_by', created_by);

        const result = await request.query(insertQuery);
        const newRecipeId = result.recordset[0].recipe_id;

        res.status(201).json({
            status: 'success',
            message: 'Recipe created successfully',
            recipe_id: newRecipeId
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

router.post('/pending', async (req, res) => {
    try {
        const pool = req.pool;
        const {
            title,
            description,
            instructions,
            cooking_time,
            difficulty,
            cuisine_type,
            created_by = 1
        } = req.body;

        // Using a parameterized query to prevent SQL injection and handle string escaping properly
        const insertQuery = `
            INSERT INTO PendingRecipes (title, description, cooking_time, difficulty,
                                 cuisine_type, instructions, created_by,
                                 created_at, updated_at)
            VALUES (@title, @description, @cooking_time, @difficulty,
                    @cuisine_type, @instructions, @created_by,
                    GETDATE(), GETDATE());
            SELECT SCOPE_IDENTITY() AS recipe_id;
        `;

        const request = pool.request();
        request.input('title', title);
        request.input('description', description || '');
        request.input('cooking_time', cooking_time);
        request.input('difficulty', difficulty);
        request.input('cuisine_type', cuisine_type);
        request.input('instructions', instructions);
        request.input('created_by', created_by);

        const result = await request.query(insertQuery);
        const newRecipeId = result.recordset[0].recipe_id;

        res.status(201).json({
            status: 'success',
            message: 'Recipe created successfully',
            recipe_id: newRecipeId
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
        const recipeId = parseInt(req.params.id);
        const {
            title,
            description,
            instructions,
            cooking_time,
            difficulty,
            cuisine_type
        } = req.body;

        // Using parameterized query
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
        request.input('title', title);
        request.input('description', description || '');
        request.input('instructions', instructions);
        request.input('cooking_time', cooking_time);
        request.input('difficulty', difficulty);
        request.input('cuisine_type', cuisine_type);
        request.input('recipeId', recipeId);

        const result = await request.query(updateQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Recipe not found'
            });
        }

        res.json({
            status: 'success', message: 'Recipe updated successfully'
        });
    } catch (err) {
        console.error('Error in PUT /recipes/:id:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Delete recipe
router.delete('/:id', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id);

        // Using parameterized queries for all delete operations
        const request = pool.request();
        request.input('recipeId', recipeId);

        // First delete from related tables to maintain referential integrity
        await request.query(`DELETE
                             FROM RecipeIngredients
                             WHERE recipe_id = @recipeId`);
        await request.query(`DELETE
                             FROM RecipeSteps
                             WHERE recipe_id = @recipeId`);
        await request.query(`DELETE
                             FROM Reviews
                             WHERE recipe_id = @recipeId`);
        await request.query(`DELETE
                             FROM SavedRecipes
                             WHERE recipe_id = @recipeId`);

        const deleteResult = await request.query(`DELETE
                                                  FROM Recipes
                                                  WHERE recipe_id = @recipeId`);

        if (deleteResult.rowsAffected[0] === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Recipe not found'
            });
        }

        res.json({
            status: 'success', message: 'Recipe deleted successfully'
        });
    } catch (err) {
        console.error('Error in DELETE /recipes/:id:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Add ingredient to recipe
router.post('/:id/ingredients', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id);
        const {ingredient_id, quantity, unit} = req.body;

        // Using parameterized query
        const insertQuery = `
            INSERT INTO RecipeIngredients (recipe_id, ingredient_id, quantity, unit)
            VALUES (@recipeId, @ingredientId, @quantity, @unit)
        `;

        const request = pool.request();
        request.input('recipeId', recipeId);
        request.input('ingredientId', ingredient_id);
        request.input('quantity', quantity);
        request.input('unit', unit);

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

// Get all ingredients for a recipe
router.get('/:id/ingredients', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id);

        // Using parameterized query
        const query = `
            SELECT i.ingredient_id, i.name, ri.quantity, ri.unit
            FROM Ingredients i
                     JOIN RecipeIngredients ri ON i.ingredient_id = ri.ingredient_id
            WHERE ri.recipe_id = @recipeId
        `;

        const request = pool.request();
        request.input('recipeId', recipeId);
        const result = await request.query(query);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error in GET /recipes/:id/ingredients:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Add pending ingredient to recipe
router.post('/:id/pending-ingredients', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id);
        const {ingredient_id, quantity, unit} = req.body;

        // Using parameterized query
        const insertQuery = `
            INSERT INTO PendingRecipeIngredients (recipe_id, ingredient_id, quantity, unit)
            VALUES (@recipeId, @ingredientId, @quantity, @unit)
        `;

        const request = pool.request();
        request.input('recipeId', recipeId);
        request.input('ingredientId', ingredient_id);
        request.input('quantity', quantity);
        request.input('unit', unit);

        await request.query(insertQuery);

        res.status(201).json({
            status: 'success',
            message: 'Ingredient added to pending recipe successfully'
        });
    } catch (err) {
        console.error('Error in POST /recipes/:id/pending-ingredients:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Update ingredient in recipe
router.put('/:recipeId/ingredients/:ingredientId', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.recipeId);
        const ingredientId = parseInt(req.params.ingredientId);
        const {quantity, unit} = req.body;

        // Using parameterized query
        const updateQuery = `
            UPDATE RecipeIngredients
            SET quantity = @quantity,
                unit     = @unit
            WHERE recipe_id = @recipeId
              AND ingredient_id = @ingredientId
        `;

        const request = pool.request();
        request.input('quantity', quantity);
        request.input('unit', unit);
        request.input('recipeId', recipeId);
        request.input('ingredientId', ingredientId);

        const result = await request.query(updateQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Ingredient not found in this recipe'
            });
        }

        res.json({
            status: 'success', message: 'Recipe ingredient updated successfully'
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

// Remove ingredient from recipe
router.delete('/:recipeId/ingredients/:ingredientId', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.recipeId);
        const ingredientId = parseInt(req.params.ingredientId);

        // Using parameterized query
        const deleteQuery = `
            DELETE
            FROM RecipeIngredients
            WHERE recipe_id = @recipeId
              AND ingredient_id = @ingredientId
        `;

        const request = pool.request();
        request.input('recipeId', recipeId);
        request.input('ingredientId', ingredientId);

        const result = await request.query(deleteQuery);

        if (result.rowsAffected[0] === 0) {
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
        const recipeId = parseInt(req.params.id);

        // Using parameterized query
        const query = `
            SELECT step_number, description
            FROM RecipeSteps
            WHERE recipe_id = @recipeId
            ORDER BY step_number;
        `;

        const request = pool.request();
        request.input('recipeId', recipeId);
        const result = await request.query(query);

        res.json(result.recordset);
    } catch (err) {
        console.error(`Error in GET /recipes/${req.params.id}/steps:`, err);
        res.status(500).json({
            status: 'error',
            message: 'Server Error',
            details: err.message
        });
    }
});

// Get all pending ingredients for a recipe
router.get('/:id/pending-ingredients', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId = parseInt(req.params.id);
        const query = `
      SELECT i.ingredient_id, i.name, pri.quantity, pri.unit
      FROM Ingredients i
           JOIN PendingRecipeIngredients pri
             ON i.ingredient_id = pri.ingredient_id
      WHERE pri.recipe_id = @recipeId
    `;
        const request = pool.request();
        request.input('recipeId', recipeId);
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({status:'error',message:'Server Error',details:err.message});
    }
});

// Update a pending ingredient
router.patch('/:id/pending-ingredients/:ingredientId', async (req, res) => {
    const pool = req.pool;
    const recipeId     = parseInt(req.params.id, 10);
    const ingredientId = parseInt(req.params.ingredientId, 10);
    const allowed      = ['quantity', 'unit'];
    const updates      = [];
    const request      = pool.request();

    request.input('recipeId', recipeId);
    request.input('ingredientId', ingredientId);

    for (const key of allowed) {
        if (req.body[key] !== undefined) {
            updates.push(`${key} = @${key}`);
            request.input(key, req.body[key]);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ status: 'error', message: 'No valid fields provided for update' });
    }

    const sql = `
    UPDATE PendingRecipeIngredients
       SET ${updates.join(', ')}
     WHERE recipe_id     = @recipeId
       AND ingredient_id = @ingredientId
  `;

    try {
        const result = await request.query(sql);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ status: 'error', message: 'Pending ingredient not found' });
        }
        res.json({ status: 'success', message: 'Pending ingredient updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Server Error', details: err.message });
    }
});

// Delete a pending ingredient
router.delete('/:id/pending-ingredients/:ingredientId', async (req, res) => {
    try {
        const pool = req.pool;
        const recipeId     = parseInt(req.params.id);
        const ingredientId = parseInt(req.params.ingredientId);

        const deleteQuery = `
      DELETE FROM PendingRecipeIngredients
      WHERE recipe_id     = @recipeId
        AND ingredient_id = @ingredientId
    `;
        const request = pool.request();
        request.input('recipeId', recipeId);
        request.input('ingredientId', ingredientId);

        const result = await request.query(deleteQuery);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({status:'error',message:'Pending ingredient not found'});
        }
        res.json({status:'success',message:'Pending ingredient removed'});
    } catch (err) {
        console.error(err);
        res.status(500).json({status:'error',message:'Server Error',details:err.message});
    }
});

module.exports = router;