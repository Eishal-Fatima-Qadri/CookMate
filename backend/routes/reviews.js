const express = require("express");
const router = express.Router();
const { poolPromise } = require("../db");
const sql = require("mssql");

// POST a new review
router.post("/", async (req, res) => {
  const { recipe_id, user_name, rating, comment } = req.body;

  // Basic validation
  if (!recipe_id || !user_name || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("recipe_id", sql.Int, recipe_id)
      .input("user_name", sql.NVarChar, user_name)
      .input("rating", sql.Int, rating)
      .input("comment", sql.Text, comment)
      .query(
        `INSERT INTO Reviews (recipe_id, user_name, rating, comment)
         VALUES (@recipe_id, @user_name, @rating, @comment)`
      );

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
      .query(
        `SELECT * FROM reviews WHERE recipe_id = @recipe_id ORDER BY created_at DESC`
      );

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

module.exports = router;
