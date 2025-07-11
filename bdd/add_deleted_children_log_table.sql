-- Création de la table pour enregistrer les suppressions d'enfants
CREATE TABLE IF NOT EXISTS DeletedChildrenLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_id INT NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    child_data JSON,
    INDEX idx_deleted_children_original_id (original_id),
    INDEX idx_deleted_children_action_date (action_date)
);
