USE csb;
CREATE TABLE accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY, -- Identifiant unique pour chaque compte
    username VARCHAR(50) NOT NULL UNIQUE,      -- Nom d'utilisateur unique
    password_hash VARCHAR(255) NOT NULL,       -- Mot de passe (hashé pour des raisons de sécurité)
    account_type ENUM('visitor', 'doctor', 'admin') NOT NULL, -- Type de compte : visiteur, docteur ou administrateur
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Date de création du compte
);