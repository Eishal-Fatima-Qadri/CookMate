const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");
const sql = require("mssql");

// POST a new review
router.post("/", async (req, res) => {
	const { recipe_id, user_id, rating, comment } = req.body;

	// Basic validation
	if (!recipe_id || !user_id || !rating || rating < 1 || rating > 5) {
		return res.status(400).json({ error: "Invalid input data" });
	}

	try {
		const pool = await poolPromise;
		await pool
			.request()
			.input("recipe_id", sql.Int, recipe_id)
			.input("user_id", sql.Int, user_id)
			.input("rating", sql.Int, rating)
			.input("comment", sql.VarChar(500), comment || null)
			.query(`
        INSERT INTO Reviews (recipe_id, user_id, rating, comment)
        VALUES (@recipe_id, @user_id, @rating, @comment)
      `);

		res.status(201).json({ message: "Review submitted successfully" });
	} catch (err) {
		console.error("Error adding review:", err);
		res.status(500).json({ error: "Failed to add review" });
	}
});

// GET reviews for a specific recipe
router.get("/:recipe_id", async (req, res) => {
	const { recipe_id } = req.params;

	try {
		const pool = await poolPromise;
		const result = await pool
			.request()
			.input("recipe_id", sql.Int, recipe_id)
			.query(`
        SELECT r.review_id, r.user_id, u.username, r.rating, r.comment, r.created_at
        FROM Reviews r
        JOIN Users u ON r.user_id = u.user_id
        WHERE r.recipe_id = @recipe_id
        ORDER BY r.created_at DESC
      `);

		res.status(200).json(result.recordset);
	} catch (err) {
		console.error("Error fetching reviews:", err);
		res.status(500).json({ error: "Failed to fetch reviews" });
	}
});

module.exports = router;
