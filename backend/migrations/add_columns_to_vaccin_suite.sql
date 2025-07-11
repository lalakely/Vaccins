-- Migration pour ajouter les colonnes nécessaires à la table VaccinSuite
-- Exécuter ce script sur la base de données CSB

-- Vérifier si les colonnes existent déjà avant de les ajouter

-- Ajouter la colonne 'type' pour distinguer entre 'strict', 'recommande', 'rappel'
ALTER TABLE VaccinSuite ADD COLUMN IF NOT EXISTS type ENUM('strict', 'recommande', 'rappel') DEFAULT 'recommande';

-- Ne pas ajouter la colonne 'delai' car elle existe déjà
-- La colonne 'strict' existe déjà aussi, pas besoin de l'ajouter

-- Ajouter la colonne 'description' pour les rappels
ALTER TABLE VaccinSuite ADD COLUMN IF NOT EXISTS description VARCHAR(255) DEFAULT NULL;

-- Mettre à jour les données existantes
-- Par défaut, on considère que les suites existantes sont de type 'recommande'
UPDATE VaccinSuite SET type = 'recommande' WHERE type IS NULL;
