const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authenticate = require('../middlewares/authMiddleware'); // Middleware d'authentification

// Route pour l'inscription
router.post('/register', usersController.registerUser);

// Route pour la mise à jour des informations utilisateur
router.put('/update', authenticate, usersController.updateUser);

module.exports = router;
