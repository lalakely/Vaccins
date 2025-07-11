-- Ajouter les colonnes d'âge requis pour la prescription des vaccins
ALTER TABLE Vaccins
ADD COLUMN Age_Annees INT NOT NULL DEFAULT 0,
ADD COLUMN Age_Mois INT NOT NULL DEFAULT 0,
ADD COLUMN Age_Jours INT NOT NULL DEFAULT 0;
