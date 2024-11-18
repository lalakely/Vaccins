
const db = require('../config/db');


// Create en new Vaccine 
exports.createVaccin = (req , res) => {
    const sql = `
        INSERT INTO Vaccins (
            Nom, Duree , Date_arrivee, Date_peremption , Description
        ) VALUES (? , ? , ? , ? , ?)
    `;

    const values = [
        req.body.Nom,
        req.body.Duree,
        req.body.Date_arrivee,
        req.body.Date_peremption,
        req.body.Description
    ]

    console.log('SQL : ' , sql);
    console.log('Values :' , values);

    db.query(sql , values , (err , result) => {
        if(err){
            console.error('Error details : ' , err);
            return res.status(500).json(err);
        }
        res.status(201).json({
            message : "Vaccin ajouté avec succès",
            id: result.insertId
        });
    });
};


// Getting all the Vaccine
exports.getAllVaccins = (req, res) => {
    db.query("SELECT * FROM Vaccins" , (err , results) => {
        if(err){
            return res.status(500).send(err);
        }
        res.json(results);
    });
};

// Getting Vaccin by its ID
exports.getVaccinById = (req , res) => {
    const vaccinId = req.params.id;
    db.query("SELECT * FROM Vaccins WHERE id = ?" , [vaccinId] , (err , result) => {
        if(err) {
            return res.status(500).send(err);
        }
        if(result.length === 0){
            return res.status(404).send("Vaccin Non trouvé");
        }
    });
};


// Deleting Vaccine
exports.deleteVaccin = (req , res) => {
    const vaccinId = req.params.id;

    db.query("DELETE FROM Vaccins WHERE id = ?" , [vaccinId] , (err , result) => {
        if(err) {
            return res.status(500).send(err);
        }if(result.affectedRows === 0) {
            return res.status(404).send("Vaccin non trouvé");
        }
        res.send("Vaccin supprimé avec succès");
    });
};

// Updatind informations about the vaccine
exports.updateVaccin = (req , res) => {
    const vaccinId = req.params.id;
    const {Nom , Duree , Date_arrivee , Date_peremption , Description} = req.body;
    const query = `UPDATE Vaccins SET Nom=?,Duree=?,Date_arrivee=?,Date_peremption=?,Description=? WHERE id=?`;

    db.query(query , [Nom , Duree , Date_arrivee , Date_peremption , Description] , (err , result) => {
        if(err){
            return res.status(500).send(err);
        }
        if(result.affectedRows === 0){
            return res.status(404).send("Vaccin non trouvé");
        }
        res.send("Vaccin mis à jour");
    });
};