const express = require('express');
const router = express.Router();
const childHistoryController = require('../controllers/childHistoryController');
const authenticate = require('../middlewares/authMiddleware');

// Routes pour l'historique des modifications des enfants
router.get('/', authenticate, (req, res) => {
    childHistoryController.getAllHistory(req, res);
});

router.get('/child/:id', authenticate, (req, res) => {
    childHistoryController.getHistoryByChildId(req, res);
});

router.post('/revert/:id', authenticate, (req, res) => {
    childHistoryController.revertChange(req, res);
});

module.exports = router;
