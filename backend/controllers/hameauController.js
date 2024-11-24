const db = require('../config/db');

exports.createHameau = (req , res) => {
    const sql = `
        INSERT INTO Hameau (
            Nom , px , py
        ) VALUES (? , ? , ?)
    `;

    const values = [
        req.body.Nom,
        req.body.px,
        req.body.py
    ];

    console.log('SQL :', sql);
    console.log('Values :', values);
    console.log('Values length :' , values.length);

    db.query(sql , values, (err , result) => {
        if(err) {
            console.error('Error details :' , err);
            return res.status(500).json(err);
        }
        res.status(201).json({
            message: "Enfant ajouté avec succès",
            id: result.insertId
        });
    });
}

exports.getAllEnfants = (req, res) => {
    db.query("SELECT * FROM Hameau" , (err , results) => {
        if(err){
            return res.status(500).send(err);
        }
        res.json(results);
    });
}

exports.getHameauById = (req , res) => {
    const enfantId = req.params.id;
    db.query("SELECT * FROM Hameau WHERE id = ?" , [enfantId] , (err , result) => {
        if(err){
            return res.status(500).send(err);
        }
        if(result.length === 0){
            return res.status(404).send("Hameau non trouvé");
        }
    });
};

exports.updateHameau = (req , res) => {
    const hameauId = req.params.id;
    const {Nom , px , py} = req.body;
    const query = `UPDATE Hameau SET Nom = ? , px = ? , py = ? WHERE id = ?`;

    db.query(query , [Nom , px , py , hameauId] , (err , result) => {
        if(err){
            return res.status(500).send(err);
        }
        if(result.affectedRows === 0){
            return res.status(404).send("Hameau non trouvé");
        }
        res.send("Hameau mis à jour avec succès");
    })
};

exports.deleteHameau = (req , res) => {
    const hameauId = req.params.id;

    db.query("DELETE FROM Hameau WHERE id = ?" , [hameauId] , (err , result) => {
        if(err) {
            return res.status(500).send(err);
        }if(result.affectesRows === 0){
            return res.stetus(404).send("Hameau non trouvé");
        }
        res.send("Hameau supprimé avec succès");
    });
};