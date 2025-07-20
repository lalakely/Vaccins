const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const authenticate = require('../middlewares/authMiddleware');

// Appliquer le middleware d'authentification à toutes les routes
router.use(authenticate);

// Routes pour les notifications
router.get('/', notificationsController.getNotifications);
router.post('/', notificationsController.createNotification);

// Routes statiques (doivent être définies avant les routes paramétriques)
router.patch('/read-all', notificationsController.markAllAsRead);
router.delete('/all', notificationsController.deleteAllNotifications);
router.post('/clean-expired', notificationsController.cleanExpiredNotifications);

// Routes paramétriques
router.patch('/:id/read', notificationsController.markAsRead);
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
