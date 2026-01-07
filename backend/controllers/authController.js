const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();
const os = require("os");

// Fonction pour récupérer l'IP de l'utilisateur
const getUserIP = (req) => {
    return req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "Inconnu";
};

// 📌 Connexion et mise à jour du statut de l'utilisateur
exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis." });
        }

        // Vérifier si l'utilisateur existe
        const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const user = rows[0];

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Mot de passe incorrect." });
        }

        // Générer un token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, accountType: user.account_type },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 📌 Mettre à jour l'état de l'utilisateur à "connecté"
        await db.query("UPDATE users SET status = 'connecté' WHERE id = ?", [user.id]);

        // 📌 Enregistrer la connexion dans la table `logins`
        const ipAddress = getUserIP(req);
        await db.query(
            "INSERT INTO logins (user_id, username, ip_address, status) VALUES (?, ?, ?, 'connecté') ON DUPLICATE KEY UPDATE status = 'connecté', ip_address = ?",
            [user.id, user.username, ipAddress, ipAddress]
        );

        return res.status(200).json({
            message: "Connexion réussie.",
            token,
            user: {
                id: user.id,
                username: user.username,
                accountType: user.account_type,
                status: "connecté"
            },
        });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        return res.status(500).json({
            message: "Erreur interne du serveur.",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        const userId = req.user.id; // Récupérer l'ID de l'utilisateur à partir du token

        // 📌 Mettre à jour l'état de l'utilisateur à "déconnecté"
        await db.query("UPDATE users SET status = 'déconnecté' WHERE id = ?", [userId]);
        await db.query("UPDATE logins SET status = 'déconnecté' WHERE user_id = ?", [userId]);

        return res.status(200).json({ message: "Déconnexion réussie." });
    } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
