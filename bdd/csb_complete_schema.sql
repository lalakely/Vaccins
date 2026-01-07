-- ============================================================================
-- SCRIPT COMPLET DE CRÉATION DE LA BASE DE DONNÉES CSB POUR VPS
-- ============================================================================
-- Ce script recrée la structure complète de la base de données.
-- Exécutez ce script sur votre VPS après avoir créé la base de données 'csb'.
--
-- UTILISATION:
--   mysql -u csb -p csb < csb_complete_schema.sql
--
-- ============================================================================

-- Configuration initiale
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS csb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE csb;

-- ============================================================================
-- TABLE: users (Utilisateurs du système)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    account_type ENUM('admin', 'user', 'moderator') DEFAULT 'user',
    status ENUM('connecté', 'déconnecté') DEFAULT 'déconnecté',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: Fokotany (Zones géographiques principales)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Fokotany (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nom VARCHAR(100) NOT NULL,
    px DECIMAL(10, 6),
    py DECIMAL(10, 6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: Hameau (Sous-zones géographiques)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Hameau (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Nom VARCHAR(100) NOT NULL,
    px DOUBLE NOT NULL,
    py DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: Enfants (Enfants enregistrés)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Enfants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Nom VARCHAR(100) NOT NULL,
    Prenom VARCHAR(100) NOT NULL,
    CODE VARCHAR(50) UNIQUE,
    date_naissance DATE NOT NULL,
    age_premier_contact INT,
    SEXE ENUM('M', 'F') NOT NULL,
    NomMere VARCHAR(100),
    NomPere VARCHAR(100),
    Domicile VARCHAR(255),
    Fokotany VARCHAR(100),
    Hameau VARCHAR(100),
    Telephone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: Vaccins (Liste des vaccins)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Vaccins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Nom VARCHAR(100) NOT NULL,
    Duree INT,                          -- Durée en jours
    Date_arrivee DATE,
    Date_peremption DATE,
    Description TEXT,
    Lot VARCHAR(255) DEFAULT '',        -- Numéro de lot
    Stock INT DEFAULT 0,                -- Stock disponible
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT check_stock_non_negative CHECK (Stock >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: VaccinPrerequis (Prérequis entre vaccins)
-- ============================================================================
CREATE TABLE IF NOT EXISTS VaccinPrerequis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vaccin_id INT NOT NULL,
    prerequis_id INT NOT NULL,
    strict BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (vaccin_id) REFERENCES Vaccins(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequis_id) REFERENCES Vaccins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: VaccinSuite (Suites et rappels de vaccins)
-- ============================================================================
CREATE TABLE IF NOT EXISTS VaccinSuite (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vaccin_id INT NOT NULL,
    suite_id INT NOT NULL,
    strict BOOLEAN NOT NULL DEFAULT FALSE,
    delai INT NOT NULL DEFAULT 0,
    type ENUM('strict', 'recommande', 'rappel') DEFAULT 'recommande',
    description VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (vaccin_id) REFERENCES Vaccins(id) ON DELETE CASCADE,
    FOREIGN KEY (suite_id) REFERENCES Vaccins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: Vaccinations (Enregistrement des vaccinations effectuées)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Vaccinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enfant_id INT NOT NULL,
    vaccin_id INT NOT NULL,
    date_vaccination DATE NOT NULL,
    remarque TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enfant_id) REFERENCES Enfants(id) ON DELETE CASCADE,
    FOREIGN KEY (vaccin_id) REFERENCES Vaccins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: ChildHistory (Historique des modifications des enfants)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ChildHistory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    action_type ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    old_data JSON,
    new_data JSON,
    FOREIGN KEY (child_id) REFERENCES Enfants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_child_history_child_id ON ChildHistory(child_id);
CREATE INDEX idx_child_history_action_date ON ChildHistory(action_date);

-- ============================================================================
-- TABLE: DeletedChildrenLog (Log des enfants supprimés)
-- ============================================================================
CREATE TABLE IF NOT EXISTS DeletedChildrenLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_id INT NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    child_data JSON,
    INDEX idx_deleted_children_original_id (original_id),
    INDEX idx_deleted_children_action_date (action_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: notifications (Notifications du système)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('success', 'error', 'warning', 'info') NOT NULL DEFAULT 'info',
    category ENUM(
        'action_feedback',
        'vaccination_alert',
        'statistics',
        'system',
        'user_activity'
    ) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_link VARCHAR(255),
    entity_type VARCHAR(50),
    entity_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_category ON notifications(category);

-- ============================================================================
-- PROCÉDURES STOCKÉES: Gestion des notifications
-- ============================================================================

DELIMITER //

-- Créer une notification
CREATE PROCEDURE IF NOT EXISTS create_notification(
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

-- Marquer une notification comme lue
CREATE PROCEDURE IF NOT EXISTS mark_notification_as_read(
    IN p_notification_id INT
)
BEGIN
    UPDATE notifications SET is_read = TRUE WHERE id = p_notification_id;
END //

-- Marquer toutes les notifications d'un utilisateur comme lues
CREATE PROCEDURE IF NOT EXISTS mark_all_notifications_as_read(
    IN p_user_id INT
)
BEGIN
    UPDATE notifications SET is_read = TRUE WHERE user_id = p_user_id OR user_id IS NULL;
END //

-- Supprimer les notifications expirées
CREATE PROCEDURE IF NOT EXISTS delete_expired_notifications()
BEGIN
    DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at < NOW();
END //

DELIMITER ;

-- ============================================================================
-- ÉVÉNEMENTS: Nettoyage automatique
-- ============================================================================

-- Activer le scheduler d'événements
SET GLOBAL event_scheduler = ON;

DELIMITER //

-- Événement pour nettoyer les notifications expirées quotidiennement
CREATE EVENT IF NOT EXISTS clean_expired_notifications
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    CALL delete_expired_notifications();
END //

DELIMITER ;

-- ============================================================================
-- CRÉATION D'UN UTILISATEUR ADMIN PAR DÉFAUT
-- ============================================================================
-- Mot de passe: admin123 (hash bcrypt)
-- IMPORTANT: Changez ce mot de passe en production !
INSERT INTO users (username, password_hash, account_type, status) 
VALUES ('admin', '$2a$10$XQxBtUjFoVpNdueKsYoD8eVJdE8Xd7N8TGhDfVzsFmCpT6TfhCKPC', 'admin', 'déconnecté')
ON DUPLICATE KEY UPDATE username = username;

-- ============================================================================
-- RÉACTIVER LES CONTRAINTES DE CLÉS ÉTRANGÈRES
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
SELECT '✅ Base de données CSB créée avec succès !' AS message;
SELECT CONCAT('📊 Tables créées: ', 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'csb')
) AS tables_count;
