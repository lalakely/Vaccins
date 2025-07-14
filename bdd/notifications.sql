USE csb;

-- Table pour stocker les notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,                                        -- ID de l'utilisateur destinataire (NULL pour tous les utilisateurs)
    title VARCHAR(100) NOT NULL,                        -- Titre court de la notification
    message TEXT NOT NULL,                              -- Message détaillé
    type ENUM('success', 'error', 'warning', 'info') NOT NULL DEFAULT 'info', -- Type visuel
    category ENUM(
        'action_feedback',                              -- Confirmation d'actions
        'vaccination_alert',                            -- Alertes liées aux vaccinations
        'statistics',                                   -- Statistiques et rapports
        'system',                                       -- Système et administration
        'user_activity'                                 -- Activité utilisateur
    ) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,                      -- Si la notification a été lue
    action_link VARCHAR(255),                           -- Lien optionnel vers une page
    entity_type VARCHAR(50),                            -- Type d'entité concernée (enfant, vaccin, fokotany, etc.)
    entity_id INT,                                      -- ID de l'entité concernée
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- Date de création
    expires_at TIMESTAMP NULL,                          -- Date d'expiration (NULL = pas d'expiration)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_category ON notifications(category);

-- Procédure pour créer une notification
DELIMITER //
CREATE PROCEDURE create_notification(
    IN p_user_id INT,
    IN p_title VARCHAR(100),
    IN p_message TEXT,
    IN p_type ENUM('success', 'error', 'warning', 'info'),
    IN p_category ENUM('action_feedback', 'vaccination_alert', 'statistics', 'system', 'user_activity'),
    IN p_action_link VARCHAR(255),
    IN p_entity_type VARCHAR(50),
    IN p_entity_id INT,
    IN p_expires_at TIMESTAMP
)
BEGIN
    INSERT INTO notifications (
        user_id, title, message, type, category, 
        action_link, entity_type, entity_id, expires_at
    ) VALUES (
        p_user_id, p_title, p_message, p_type, p_category, 
        p_action_link, p_entity_type, p_entity_id, p_expires_at
    );
END //
DELIMITER ;

-- Procédure pour marquer une notification comme lue
DELIMITER //
CREATE PROCEDURE mark_notification_as_read(
    IN p_notification_id INT
)
BEGIN
    UPDATE notifications SET is_read = TRUE WHERE id = p_notification_id;
END //
DELIMITER ;

-- Procédure pour marquer toutes les notifications d'un utilisateur comme lues
DELIMITER //
CREATE PROCEDURE mark_all_notifications_as_read(
    IN p_user_id INT
)
BEGIN
    UPDATE notifications SET is_read = TRUE WHERE user_id = p_user_id OR user_id IS NULL;
END //
DELIMITER ;

-- Procédure pour supprimer les notifications expirées
DELIMITER //
CREATE PROCEDURE delete_expired_notifications()
BEGIN
    DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at < NOW();
END //
DELIMITER ;

-- Événement pour nettoyer automatiquement les notifications expirées (exécuté quotidiennement)
DELIMITER //
CREATE EVENT IF NOT EXISTS clean_expired_notifications
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    CALL delete_expired_notifications();
END //
DELIMITER ;
