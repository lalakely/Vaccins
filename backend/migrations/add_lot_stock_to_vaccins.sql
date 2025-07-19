-- Ajouter les colonnes (sans IF NOT EXISTS)
ALTER TABLE Vaccins ADD COLUMN Lot VARCHAR(255) DEFAULT '';
ALTER TABLE Vaccins ADD COLUMN Stock INT DEFAULT 0;

-- Ajouter la contrainte
ALTER TABLE Vaccins ADD CONSTRAINT check_stock_non_negative CHECK (Stock >= 0);
