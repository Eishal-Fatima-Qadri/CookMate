require('dotenv').config();
const sql = require('mssql');

const poolPromise = new sql.ConnectionPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: process.env.NODE_ENV !== 'production'
    }
})
    .connect()
    .then(pool => {
        console.log('✅ MSSQL pool connected');
        return pool;
    })
    .catch(err => {
        console.error('❌ MSSQL pool failed to connect:', err);
        throw err;
    });

module.exports = {poolPromise, sql};