use csb;

CREATE TABLE Enfants (
    id INT AUTO_INCREMENT PRIMARY KEY,       
    Nom VARCHAR(255) NOT NULL,               
    Prenom VARCHAR(255) NOT NULL,            
    CODE VARCHAR(50) UNIQUE NOT NULL,        
    date_naissance DATE NOT NULL,           
    age_premier_contact INT NOT NULL,        
    SEXE ENUM('M', 'F') NOT NULL,           
    NomMere VARCHAR(255) NOT NULL,           
    NomPere VARCHAR(255) NOT NULL,          
    Domicile VARCHAR(255) NOT NULL,         
    Fokotany VARCHAR(255) NOT NULL,         
    Hameau VARCHAR(255),                    
    Telephone VARCHAR(20)                   
