-- Script pour ajouter les colonnes 'strict' et 'delai' à la table VaccinSuite

-- Ajout de la colonne 'strict' (booléen, par défaut à false)
ALTER TABLE VaccinSuite
ADD COLUMN strict BOOLEAN NOT NULL DEFAULT FALSE;

-- Ajout de la colonne 'delai' (entier, nombre de jours, par défaut à 0)
ALTER TABLE VaccinSuite
ADD COLUMN delai INT NOT NULL DEFAULT 0;

-- Message de confirmation
SELECT 'Colonnes "strict" et "delai" ajoutées à la table VaccinSuite' AS message;
