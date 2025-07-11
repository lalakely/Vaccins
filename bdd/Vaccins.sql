USE csb;

-- 📌 Création de la table Vaccins
CREATE TABLE IF NOT EXISTS Vaccins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Nom VARCHAR(100) NOT NULL,
    Duree INT, -- Modifié pour stocker la durée en nombre de jours
    Date_arrivee DATE,
    Date_peremption DATE,
    Description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS VaccinPrerequis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vaccin_id INT NOT NULL,          -- Le vaccin qui a un prérequis
    prerequis_id INT NOT NULL,       -- Le vaccin requis avant l’autre
    strict BOOLEAN NOT NULL DEFAULT FALSE, -- Indique si le prérequis est strict ou non
    FOREIGN KEY (vaccin_id) REFERENCES Vaccins(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequis_id) REFERENCES Vaccins(id) ON DELETE CASCADE
);

-- Table pour gérer les vaccins qui doivent suivre d'autres vaccins (suites)
CREATE TABLE IF NOT EXISTS VaccinSuite (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vaccin_id INT NOT NULL,          -- Le vaccin qui doit être suivi par un autre
    suite_id INT NOT NULL,           -- Le vaccin qui doit suivre
    FOREIGN KEY (vaccin_id) REFERENCES Vaccins(id) ON DELETE CASCADE,
    FOREIGN KEY (suite_id) REFERENCES Vaccins(id) ON DELETE CASCADE
);
