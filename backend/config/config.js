require('dotenv').config();

// Configuration pour l'application
module.exports = {
    // Clé secrète pour les tokens JWT
    jwtSecret: process.env.JWT_SECRET || 'votre_clé_secrète_par_défaut',
    
    // Durée de validité du token (en secondes)
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    
    // Autres configurations de l'application
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
};
