const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const authenticate = require('../middlewares/authMiddleware');

// Appliquer le middleware d'authentification à toutes les routes
router.use(authenticate);

// Routes pour les notifications
router.get('/', notificationsController.getNotifications);
router.post('/', notificationsController.createNotification);
router.patch('/:id/read', notificationsController.markAsRead);
router.patch('/read-all', notificationsController.markAllAsRead);
router.delete('/:id', notificationsController.deleteNotification);
router.post('/clean-expired', notificationsController.cleanExpiredNotifications);

module.exports = router;
