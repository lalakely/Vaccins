-- Création de la table d'historique des modifications des enfants
CREATE TABLE IF NOT EXISTS ChildHistory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    action_type ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    old_data JSON,
    new_data JSON,
    FOREIGN KEY (child_id) REFERENCES Enfants(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX idx_child_history_child_id ON ChildHistory(child_id);
CREATE INDEX idx_child_history_action_date ON ChildHistory(action_date);
