const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}); 

db.connect((err) => {
    if(err){
        console.error("Erreur de connexion à Myslql");
        process.exit(1);
    } else {
        console.log("Connecté à Mysql avec succès !");
    }
});

module.exports = db;