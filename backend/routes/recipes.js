// routes/recipes.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');

router.get('/', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query('SELECT * FROM Recipes');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
