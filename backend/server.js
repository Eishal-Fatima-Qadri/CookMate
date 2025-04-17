const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const {poolPromise} = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipes');
const path = require('path');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true, // For Azure SQL
        trustServerCertificate: false // Change to true for local dev / self-signed certs
    }
};

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'client/build')));

// Check database connection
app.use(async (req, res, next) => {
    try {
        req.pool = await poolPromise;
        next();
    } catch (err) {
        console.error('Database connection error', err);
        res.status(500).send('Server Error');
    }
});

// Users
app.use('/api/users', userRoutes);

// Recipes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api/recipes', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT * FROM Recipes`;
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching recipes:', err);
        res.status(500).send('Database error');
    }
});
app.use('/api/recipes', recipeRoutes); // your actual API

// Catch-all for frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);