use csb;

CREATE TABLE Fokotany (
    ID INT AUTO_INCREMENT PRIMARY KEY, -- Identifiant unique
    Nom VARCHAR(255) NOT NULL,         -- Nom du Fokotany
    px FLOAT NOT NULL,                 -- Coordonnée X
    py FLOAT NOT NULL                  -- Coordonnée Y
);
