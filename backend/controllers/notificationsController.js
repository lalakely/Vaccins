const db = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// Récupérer toutes les notifications pour l'utilisateur connecté
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer les notifications spécifiques à l'utilisateur ET les notifications générales (user_id = NULL)
    const [rows] = await db.query(
      `SELECT 
        id, 
        title, 
        message, 
        type, 
        category, 
        is_read AS isRead, 
        action_link AS actionLink, 
        entity_type AS entityType, 
        entity_id AS entityId, 
        created_at AS createdAt, 
        expires_at AS expiresAt 
      FROM notifications 
      WHERE (user_id = ? OR user_id IS NULL) 
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC 
      LIMIT 50`,
      [userId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des notifications' });
  }
};

// Créer une nouvelle notification
exports.createNotification = async (req, res) => {
  try {
    const { 
      userId, // peut être null pour les notifications globales
      title, 
      message, 
      type, 
      category, 
      actionLink, 
      entityType, 
      entityId, 
      expiresAt 
    } = req.body;
    
    // Vérifier les champs obligatoires
    if (!title || !message || !type || !category) {
      return res.status(400).json({ message: 'Titre, message, type et catégorie sont obligatoires' });
    }
    
    // Insérer la notification dans la base de données
    const [result] = await db.query(
      `INSERT INTO notifications 
        (user_id, title, message, type, category, action_link, entity_type, entity_id, expires_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId || null, title, message, type, category, actionLink, entityType, entityId, expiresAt]
    );
    
    // Récupérer la notification créée
    const [notifications] = await db.query(
      `SELECT 
        id, 
        title, 
        message, 
        type, 
        category, 
        is_read AS isRead, 
        action_link AS actionLink, 
        entity_type AS entityType, 
        entity_id AS entityId, 
        created_at AS createdAt, 
        expires_at AS expiresAt 
      FROM notifications 
      WHERE id = ?`,
      [result.insertId]
    );
    
    res.status(201).json(notifications[0]);
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la notification' });
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    // Vérifier que la notification appartient à l'utilisateur ou est globale
    const [notification] = await db.query(
      'SELECT * FROM notifications WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
      [notificationId, userId]
    );
    
    if (notification.length === 0) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    // Mettre à jour le statut de la notification
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );
    
    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error);
    res.status(500).json({ message: 'Erreur serveur lors du marquage de la notification' });
  }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mettre à jour toutes les notifications de l'utilisateur
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? OR user_id IS NULL',
      [userId]
    );
    
    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications:', error);
    res.status(500).json({ message: 'Erreur serveur lors du marquage de toutes les notifications' });
  }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    // Vérifier que la notification appartient à l'utilisateur ou est globale
    const [notification] = await db.query(
      'SELECT * FROM notifications WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
      [notificationId, userId]
    );
    
    if (notification.length === 0) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    // Supprimer la notification
    await db.query(
      'DELETE FROM notifications WHERE id = ?',
      [notificationId]
    );
    
    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de la notification' });
  }
};

// Créer une notification pour un événement spécifique (utile pour les hooks)
exports.createSystemNotification = async (eventType, data) => {
  try {
    let title, message, type, category, actionLink, entityType, entityId, userId;
    
    // Configurer la notification en fonction du type d'événement
    switch (eventType) {
      case 'vaccination_scheduled':
        title = 'Vaccination planifiée';
        message = `Vaccination ${data.vaccinName} planifiée pour ${data.childName} le ${new Date(data.scheduledDate).toLocaleDateString()}`;
        type = 'info';
        category = 'vaccination_alert';
        actionLink = `/Personnes?id=${data.childId}`;
        entityType = 'enfant';
        entityId = data.childId;
        userId = data.userId;
        break;
        
      case 'vaccination_completed':
        title = 'Vaccination effectuée';
        message = `${data.childName} a reçu le vaccin ${data.vaccinName}`;
        type = 'success';
        category = 'action_feedback';
        actionLink = `/Personnes?id=${data.childId}`;
        entityType = 'enfant';
        entityId = data.childId;
        userId = data.userId;
        break;
        
      case 'vaccination_missed':
        title = 'Vaccination manquée';
        message = `${data.childName} a manqué le vaccin ${data.vaccinName} prévu le ${new Date(data.scheduledDate).toLocaleDateString()}`;
        type = 'warning';
        category = 'vaccination_alert';
        actionLink = `/Personnes?id=${data.childId}`;
        entityType = 'enfant';
        entityId = data.childId;
        userId = data.userId;
        break;
        
      case 'vaccine_expiring_soon':
        title = 'Vaccin bientôt expiré';
        message = `Le vaccin ${data.vaccinName} expire le ${new Date(data.expiryDate).toLocaleDateString()}`;
        type = 'warning';
        category = 'system';
        actionLink = `/Vaccins`;
        entityType = 'vaccin';
        entityId = data.vaccineId;
        // Notification globale pour tous les administrateurs
        break;
        
      case 'low_coverage_alert':
        title = 'Faible couverture vaccinale';
        message = `La couverture vaccinale dans ${data.locationName} est de ${data.coverageRate}%, en dessous de l'objectif`;
        type = 'warning';
        category = 'statistics';
        actionLink = data.locationtype === 'fokotany' ? `/Fokotany` : `/Hameau`;
        entityType = data.locationType;
        entityId = data.locationId;
        // Notification globale pour tous les utilisateurs
        break;
        
      default:
        // Notification générique
        title = data.title || 'Notification système';
        message = data.message || 'Une nouvelle notification système est disponible';
        type = data.type || 'info';
        category = data.category || 'system';
        actionLink = data.actionLink;
        entityType = data.entityType;
        entityId = data.entityId;
        userId = data.userId;
    }
    
    // Insérer la notification dans la base de données
    await db.query(
      `INSERT INTO notifications 
        (user_id, title, message, type, category, action_link, entity_type, entity_id, expires_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
      [userId, title, message, type, category, actionLink, entityType, entityId]
    );
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la création de la notification système:', error);
    return false;
  }
};

// Nettoyer les notifications expirées (peut être appelé par un cron job)
exports.cleanExpiredNotifications = async (req, res) => {
  try {
    // Supprimer les notifications expirées
    const [result] = await db.query(
      'DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at < NOW()'
    );
    
    res.json({ 
      message: 'Nettoyage des notifications terminé', 
      deletedCount: result.affectedRows 
    });
  } catch (error) {
    console.error('Erreur lors du nettoyage des notifications:', error);
    res.status(500).json({ message: 'Erreur serveur lors du nettoyage des notifications' });
  }
};
