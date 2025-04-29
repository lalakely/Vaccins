use csb;

-- 📌 Création de la table Enfants
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
);

-- 📌 Création de la table Vaccinations (mentionnée dans le code)
