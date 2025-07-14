const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Fichier de configuration de la base de données

exports.registerUser = async (req, res) => {
    try {
        console.log('Requête reçue :', req.body);

        const { username, accountType, password } = req.body;

        if (!username   || !accountType || !password) {
            console.error('Données manquantes :', req.body);
            return res.status(400).json({ message: 'Données manquantes.' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Mot de passe haché :', hashedPassword);

        // Insertion dans la base de données
        const [result] = await db.query(
            'INSERT INTO users (username, account_type, password_hash) VALUES (?, ?, ?)',
            [username, accountType, hashedPassword]
        );

        console.log('Utilisateur créé avec succès :', result);

        return res.status(201).json({
            message: 'Utilisateur enregistré avec succès.',
            userId: result.insertId,
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
        res.status(500).json({ message: 'Une erreur est survenue. Veuillez réessayer.' });
    }
};
