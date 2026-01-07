const mysql = require('mysql2/promise'); // Importez la version avec promesses
require('dotenv').config();

// Créez un pool de connexions
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Gérer les erreurs de connexion au pool
pool.on('connection', (connection) => {
    console.log('Nouvelle connexion à la base de données établie.');
});

pool.on('error', (err) => {
    console.error('Erreur SQL imprévue sur le pool:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('La connexion à la base de données a été fermée.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('La base de données a trop de connexions.');
    }
    if (err.code === 'ECONNREFUSED') {
        console.error('La connexion à la base de données a été refusée.');
    }
});

module.exports = pool;
