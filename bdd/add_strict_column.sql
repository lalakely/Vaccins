-- Ajouter la colonne strict à la table VaccinPrerequis
ALTER TABLE VaccinPrerequis
ADD COLUMN strict BOOLEAN NOT NULL DEFAULT FALSE;
