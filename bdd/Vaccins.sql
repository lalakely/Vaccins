USE csb;

-- 📌 Création de la table Vaccins
CREATE TABLE IF NOT EXISTS Vaccins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Nom VARCHAR(100) NOT NULL,
    Duree INT, -- Durée en jours, semaines ou mois selon votre logique métier
    Date_arrivee DATE,
    Date_peremption DATE,
    Description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
