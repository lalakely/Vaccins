const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Fichier de configuration de la base de données

exports.registerUser = async (req, res) => {
    try {
        console.log('Requête reçue :', req.body);

        const { username, accountType, password } = req.body;

        if (!username || !accountType || !password) {
            console.error('Données manquantes :', req.body);
            return res.status(400).json({ message: 'Données manquantes.' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Mot de passe haché :', hashedPassword);

        // Vérifier si l'utilisateur existe déjà
        const [existingUser] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            console.log(`L'utilisateur ${username} existe déjà.`);
            return res.status(409).json({ message: 'Cet utilisateur existe déjà.' });
        }

        // Insertion dans la base de données
        try {
            console.log('Tentative d\'insertion dans la table users...');
            const [result] = await db.query(
                'INSERT INTO users (username, account_type, password_hash) VALUES (?, ?, ?)',
                [username, accountType, hashedPassword]
            );

            console.log('Utilisateur créé avec succès, ID:', result.insertId);

            return res.status(201).json({
                message: 'Utilisateur enregistré avec succès.',
                userId: result.insertId,
            });
        } catch (insertError) {
            console.error('Erreur SQL lors de l\'INSERT :', insertError);
            throw insertError; // Sera attrapé par le catch global ci-dessous
        }
    } catch (error) {
        console.error('Erreur globale lors de l\'inscription :', error);
        res.status(500).json({
            message: 'Une erreur est survenue lors de l\'inscription.',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Mise à jour des informations utilisateur
exports.updateUser = async (req, res) => {
    try {
        console.log('Requête de mise à jour reçue :', req.body);

        // Récupérer l'ID utilisateur à partir du token JWT
        const userId = req.user ? req.user.id : null;

        if (!userId) {
            return res.status(401).json({ message: 'Non authentifié. Veuillez vous connecter.' });
        }

        const { username, accountType, currentPassword, newPassword, email } = req.body;

        // Vérifier si l'utilisateur existe
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        const user = users[0];

        // Préparer les champs à mettre à jour
        const updates = {};
        const queryParams = [];

        if (username) {
            updates.username = username;
        }

        if (email) {
            updates.email = email;
        }

        if (accountType) {
            updates.account_type = accountType;
        }

        // Si un nouveau mot de passe est fourni, vérifier l'ancien mot de passe
        if (newPassword && currentPassword) {
            // Vérifier que l'ancien mot de passe est correct
            const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);

            if (!passwordMatch) {
                return res.status(400).json({ message: 'Mot de passe actuel incorrect.' });
            }

            // Hacher le nouveau mot de passe
            updates.password_hash = await bcrypt.hash(newPassword, 10);
        }

        // S'il n'y a rien à mettre à jour
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Aucune information à mettre à jour.' });
        }

        // Construire la requête SQL
        let sql = 'UPDATE users SET ';
        const setClauses = [];

        for (const [key, value] of Object.entries(updates)) {
            setClauses.push(`${key} = ?`);
            queryParams.push(value);
        }

        sql += setClauses.join(', ');
        sql += ' WHERE id = ?';
        queryParams.push(userId);

        // Exécuter la mise à jour
        const [result] = await db.query(sql, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Mise à jour échouée. Utilisateur non trouvé.' });
        }

        return res.status(200).json({ message: 'Informations utilisateur mises à jour avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
        res.status(500).json({ message: 'Une erreur est survenue. Veuillez réessayer.' });
    }
};
