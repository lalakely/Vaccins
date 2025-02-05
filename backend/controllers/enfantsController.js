const db = require('../config/db');

// Add a new child 
exports.createEnfant = (req, res) => {
    const sql = `
        INSERT INTO Enfants (
            Nom, Prenom, CODE, date_naissance, age_premier_contact,
            SEXE, NomMere, NomPere, Domicile, Fokotany, Hameau, Telephone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ? , ? )
    `;
    
    const values = [
        req.body.Nom,
        req.body.Prenom,
        req.body.CODE,
        req.body.date_naissance,
        req.body.age_premier_contact,
        req.body.SEXE,
        req.body.NomMere,
        req.body.NomPere,
        req.body.Domicile,
        req.body.Fokotany,
        req.body.Hameau,
        req.body.Telephone
    ];

    console.log('SQL:', sql);
    console.log('Values:', values);
    console.log('Values length:', values.length);

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error details:', err);
            return res.status(500).json(err);
        }
        res.status(201).json({
            message: "Enfant ajouté avec succès",
            id: result.insertId
        });
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