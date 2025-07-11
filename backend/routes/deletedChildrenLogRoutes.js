const express = require('express');
const router = express.Router();
const deletedChildrenLogController = require('../controllers/deletedChildrenLogController');
const authenticate = require('../middlewares/authMiddleware');

// Routes avec authentification

// Routes pour les logs de suppression d'enfants
router.get('/', authenticate, (req, res) => {
    deletedChildrenLogController.getAllDeletedChildrenLogs(req, res);
});

router.get('/:id', authenticate, (req, res) => {
    deletedChildrenLogController.getDeletedChildLogById(req, res);
});

// Route pour restaurer un enfant supprimé
router.post('/revert/:id', authenticate, (req, res) => {
    deletedChildrenLogController.revertDeletion(req, res);
});

module.exports = router;
