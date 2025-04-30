const db = require('../config/db');

exports.createVaccination = async (req, res) => {
    const sql = `
        INSERT INTO Vaccinations (
            enfant_id, vaccin_id, date_vaccination
        ) VALUES (?, ?, ?)
    `;

    const values = [
        req.body.enfant_id,
        req.body.vaccin_id,
        req.body.date_vaccination,
    ];

    console.log('SQL :', sql);
    console.log('Values :', values);

    try {
        const [result] = await db.query(sql, values);
        const newVaccinationId = result.insertId;

        // Récupérer les données complètes de la vaccination ajoutée avec le nom du vaccin
        const [newVaccination] = await db.query(`
            SELECT v.*, vacc.Nom as name 
            FROM Vaccinations v 
            JOIN Vaccins vacc ON v.vaccin_id = vacc.id 
            WHERE v.id = ?
        `, [newVaccinationId]);

        res.status(201).json(newVaccination[0]); // Retourner l'objet complet
    } catch (err) {
        console.error('Error details :', err);
        res.status(500).json(err);
    }
};

exports.getAllVaccinations = async (req, res) => {
    const enfantId = req.query.enfant_id;

    try {
        let query = `
            SELECT v.*, vacc.Nom as name 
            FROM Vaccinations v 
            JOIN Vaccins vacc ON v.vaccin_id = vacc.id
        `;
        let params = [];

        if (enfantId) {
            query += " WHERE v.enfant_id = ?";
            params.push(enfantId);
        }

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Error fetching vaccinations:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Les autres méthodes restent inchangées
exports.getVaccinationById = async (req, res) => {
    const vaccinationId = req.params.id;

    try {
        const [result] = await db.query(`
            SELECT v.*, vacc.Nom as name 
            FROM Vaccinations v 
            JOIN Vaccins vacc ON v.vaccin_id = vacc.id 
            WHERE v.id = ?
        `, [vaccinationId]);
        if (result.length === 0) {
            return res.status(404).send("Vaccination non trouvée");
        }
        res.json(result[0]);
    } catch (err) {
        console.error('Error fetching vaccination by ID:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

exports.deleteVaccination = async (req, res) => {
    const vaccinationId = req.params.id;

    try {
        const [result] = await db.query("DELETE FROM Vaccinations WHERE id = ?", [vaccinationId]);
        if (result.affectedRows === 0) {
            return res.status(404).send("Vaccination non trouvée");
        }
        res.send("Vaccination supprimée avec succès");
    } catch (err) {
        console.error('Error deleting vaccination:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

exports.updateVaccination = async (req, res) => {
    const vaccinationId = req.params.id;
    const { enfant_id, vaccin_id, date_vaccination } = req.body;
    const query = `
        UPDATE Vaccinations 
        SET enfant_id = ?, vaccin_id = ?, date_vaccination = ? 
        WHERE id = ?
    `;

    try {
        const [result] = await db.query(query, [enfant_id, vaccin_id, date_vaccination, vaccinationId]);
        if (result.affectedRows === 0) {
            return res.status(404).send("Vaccination non trouvée");
        }
        res.send("Vaccination mise à jour");
    } catch (err) {
        console.error('Error updating vaccination:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};