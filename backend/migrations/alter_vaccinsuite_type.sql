-- Migration pour modifier la colonne 'type' de la table VaccinSuite
ALTER TABLE VaccinSuite MODIFY COLUMN type VARCHAR(20) NOT NULL;
