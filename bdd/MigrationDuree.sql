USE csb;

-- Créer une colonne temporaire pour stocker les nouvelles valeurs converties
ALTER TABLE Vaccins ADD COLUMN Duree_Jours INT;

-- Mettre à jour la colonne temporaire en convertissant les valeurs textuelles en nombres de jours
-- Note: Cette requête est simplifiée et suppose une conversion basique
-- Vous devrez peut-être l'adapter selon les formats exacts présents dans votre base de données
UPDATE Vaccins 
SET Duree_Jours = CASE
    WHEN Duree LIKE '%jour%' OR Duree LIKE '%day%' THEN CAST(SUBSTRING_INDEX(Duree, ' ', 1) AS UNSIGNED)
    WHEN Duree LIKE '%semaine%' OR Duree LIKE '%week%' THEN CAST(SUBSTRING_INDEX(Duree, ' ', 1) AS UNSIGNED) * 7
    WHEN Duree LIKE '%mois%' OR Duree LIKE '%month%' THEN CAST(SUBSTRING_INDEX(Duree, ' ', 1) AS UNSIGNED) * 30
    WHEN Duree LIKE '%an%' OR Duree LIKE '%year%' THEN CAST(SUBSTRING_INDEX(Duree, ' ', 1) AS UNSIGNED) * 365
    WHEN Duree REGEXP '^[0-9]+$' THEN CAST(Duree AS UNSIGNED) -- Si c'est déjà un nombre
    ELSE 30 -- Valeur par défaut si la conversion échoue
END;

-- Afficher pour vérification avant de finaliser la migration
SELECT id, Nom, Duree, Duree_Jours FROM Vaccins;

-- Une fois que vous avez vérifié les données, exécutez ces commandes pour finaliser:
-- ALTER TABLE Vaccins DROP COLUMN Duree;
-- ALTER TABLE Vaccins CHANGE COLUMN Duree_Jours Duree INT;
