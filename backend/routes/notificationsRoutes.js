const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { verifyToken } = require('../middleware/authMiddleware');

// Appliquer le middleware d'authentification à toutes les routes
router.use(verifyToken);

// Routes pour les notifications
router.get('/', notificationsController.getNotifications);
router.post('/', notificationsController.createNotification);
router.put('/:id/read', notificationsController.markAsRead);
router.put('/read-all', notificationsController.markAllAsRead);
router.delete('/:id', notificationsController.deleteNotification);
router.post('/clean-expired', notificationsController.cleanExpiredNotifications);

module.exports = router;
