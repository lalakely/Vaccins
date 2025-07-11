-- Supprimer la contrainte de clé étrangère existante
ALTER TABLE ChildHistory DROP FOREIGN KEY ChildHistory_ibfk_1;

-- Ajouter une nouvelle contrainte sans ON DELETE CASCADE
ALTER TABLE ChildHistory ADD CONSTRAINT ChildHistory_ibfk_1 FOREIGN KEY (child_id) REFERENCES Enfants(id);
