const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Route pour l'inscription
router.post('/register', usersController.registerUser);

module.exports = router;
