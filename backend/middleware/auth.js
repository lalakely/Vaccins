const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Middleware d'authentification pour vérifier le token JWT
 * et extraire les informations de l'utilisateur
 */
const authenticateToken = (req, res, next) => {
  // Récupérer le token d'autorisation de l'en-tête
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
  }
  
  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Ajouter les informations de l'utilisateur à l'objet req
    req.user = decoded;
    
    // Passer au middleware suivant
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(403).json({ message: 'Token invalide ou expiré.' });
  }
};

module.exports = { authenticateToken };
