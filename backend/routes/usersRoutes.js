const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/auth'); // Middleware d'authentification

// Route pour l'inscription
router.post('/register', usersController.registerUser);

// Route pour la mise à jour des informations utilisateur
router.put('/update', authenticateToken, usersController.updateUser);

module.exports = router;
