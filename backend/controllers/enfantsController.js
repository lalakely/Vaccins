

const db = require('../config/db');

// Add a new child 
exports.createEnfant = (req, res) => {
    const { Nom, Prenom, CODE, date_naissance, age_premier_contact, SEXE, NomMere, NomPere, Domicile, Fokotany, Hameau, Telephone } = req.body;

    // Vérifier que toutes les données nécessaires sont présentes
    if (!Nom || !Prenom || !CODE || !SEXE || !NomMere || !NomPere || !Domicile || !Telephone) {
        return res.status(400).send("Certaines informations sont manquantes");
    }

    const query = 'INSERT INTO Enfants (Nom, Prenom, CODE, date_naissance, age_premier_contact, SEXE, NomMere, NomPere, Domicile, Fokotany, Hameau, Telephone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [Nom, Prenom, CODE, date_naissance, age_premier_contact, SEXE, NomMere, NomPere, Domicile, Fokotany, Hameau, Telephone], (err, result) => {
        if (err) {
            console.error("Erreur de base de données: ", err);
            return res.status(500).send("Erreur serveur lors de l'ajout de l'enfant");
        }
        res.status(201).send(`Enfant ajouté avec succès, ID: ${result.insertId}`);
    });
};


exports.getAllEnfants = (req, res) => {
    db.query("SELECT * FROM Enfants" , (err , results) => {
        if(err){
            return res.status(500).send(err);
        }
        res.json(results);
    });
}; 

exports.getEnfantById = (req , res) => {
    const enfantId = req.params.id;
    db.query("SELECT * FROM Enfants WHERE id = ?", [enfantId] , (err , result) => {
        if(err){
            return res.status(500).send(err);
        }
        if(result.length === 0){
            return res.status(404).send("Enfant non trouvé");
        }
    });
};

// Update the informations about the child with the ID
exports.updateEnfant = (req , res) => {
    const enfantId = req.params.id;
    const {Nom , Prenom , CODE , date_naissance , age_premier_contact , SEXE , NomMere , NomPere , Domicile , Fokotany , Hameau , Telephone } = req.body;
    const query = `UPDATE Enfant SET Nom = ?, Prenom = ?, CODE = ?,date_naissance = ?, age_premier_contact = ?, SEXE = ?, NomMere = ?, NomPere = ?, Domicile = ?, Fokotany = ?, Hameau = ?, Telephone = ? WHERE id = ?`;

    db.query(query , [Nom , Prenom , CODE , date_naissance , age_premier_contact , SEXE , NomMere , NomPere , Domicile , Fokotany , Hameau , Telephone , enfantId ], (err , result) => {
        if (err){
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0){
            return res.status(404).send("Enfant non trouvé");
        }
        res.send("Enfant mis à jour avec succès");
    });
};

// Delete a child in the list
exports.deleteEnfant = (req , res ) => {
    const enfantId = req.params.id;

    db.query("DELETE FROM Enfants WHERE id = ?", [enfantId] , (err , result) => {
       if(err) {
        return res.status(500).send(err);
       }if (result.affectedRows === 0){
        return res.status(404).send("Enfant non trouvé");
       }
       res.send("Enfant supprimé avec succès");
    });
};