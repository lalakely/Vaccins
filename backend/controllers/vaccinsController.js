const db = require('../config/db'); // Pool MySQL compatible avec les promesses

// Create a new Vaccine
exports.createVaccin = async (req, res) => {
    const sql = `
        INSERT INTO Vaccins (
            Nom, Duree, Date_arrivee, Date_peremption, Description
        ) VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        req.body.Nom,
        req.body.Duree,
        req.body.Date_arrivee,
        req.body.Date_peremption,
        req.body.Description,
    ];

    console.log('SQL :', sql);
    console.log('Values :', values);

    try {
        const [result] = await db.query(sql, values);
        res.status(201).json({
            message: "Vaccin ajouté avec succès",
            id: result.insertId,
        });
    } catch (err) {
        console.error('Error details :', err);
        res.status(500).json(err);
    }
};

// Get all Vaccines
exports.getAllVaccins = async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM Vaccins");
        res.json(results);
    } catch (err) {
        console.error('Error fetching vaccines:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get a Vaccine by its ID
exports.getVaccinById = async (req, res) => {
    const vaccinId = req.params.id;

    try {
        const [result] = await db.query("SELECT * FROM Vaccins WHERE id = ?", [vaccinId]);
        if (result.length === 0) {
            return res.status(404).send("Vaccin Non trouvé");
        }
        res.json(result[0]); // Renvoie uniquement le premier résultat
    } catch (err) {
        console.error('Error fetching vaccine by ID:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Delete a Vaccine
exports.deleteVaccin = async (req, res) => {
    const vaccinId = req.params.id;

    try {
        const [result] = await db.query("DELETE FROM Vaccins WHERE id = ?", [vaccinId]);
        if (result.affectedRows === 0) {
            return res.status(404).send("Vaccin non trouvé");
        }
        res.send("Vaccin supprimé avec succès");
    } catch (err) {
        console.error('Error deleting vaccine:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Update a Vaccine
exports.updateVaccin = async (req, res) => {
    const vaccinId = req.params.id;
    const { Nom, Duree, Date_arrivee, Date_peremption, Description } = req.body;
    const query = `
        UPDATE Vaccins 
        SET Nom = ?, Duree = ?, Date_arrivee = ?, Date_peremption = ?, Description = ? 
        WHERE id = ?
    `;

    try {
        const [result] = await db.query(query, [Nom, Duree, Date_arrivee, Date_peremption, Description, vaccinId]);
        if (result.affectedRows === 0) {
            return res.status(404).send("Vaccin non trouvé");
        }
        res.send("Vaccin mis à jour");
    } catch (err) {
        console.error('Error updating vaccine:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
