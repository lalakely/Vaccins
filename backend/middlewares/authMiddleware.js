const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        console.log("🔴 Aucun token reçu");
        return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
    }

    try {
        console.log("🟢 Token reçu :", token);
        
        // Supprimer "Bearer " si présent
        const tokenWithoutBearer = token.startsWith("Bearer ") ? token.slice(7) : token;
        
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        console.log("🟢 Décodé :", decoded);

        req.user = decoded;
        next();
    } catch (error) {
        console.log("🔴 Token invalide ou expiré :", error.message);
        return res.status(403).json({ message: "Token invalide ou expiré." });
    }
};

module.exports = authenticate;


module.exports = authenticate;
