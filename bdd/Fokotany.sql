use csb;

-- 📌 Création de la table Fokotany
CREATE TABLE IF NOT EXISTS Fokotany (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nom VARCHAR(100) NOT NULL,
    px DECIMAL(10, 6), -- Coordonnée X, avec précision pour latitude/longitude si besoin
    py DECIMAL(10, 6), -- Coordonnée Y
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
