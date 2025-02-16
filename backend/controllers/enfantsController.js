const db = require('../config/db'); // Pool MySQL compatible avec les promesses

// Add a new child
exports.createEnfant = async (req, res) => {
    const sql = `
        INSERT INTO Enfants (
            Nom, Prenom, CODE, date_naissance, age_premier_contact,
            SEXE, NomMere, NomPere, Domicile, Fokotany, Hameau, Telephone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        req.body.Telephone,
    ];

    try {
        console.log('SQL:', sql);
        console.log('Values:', values);

        const [result] = await db.query(sql, values);
        res.status(201).json({
            message: "Enfant ajouté avec succès",
            id: result.insertId,
        });
    } catch (err) {
        console.error('Error details:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    }
};

// Get all children
exports.getAllEnfants = async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM Enfants");
        res.json(results);
    } catch (err) {
        console.error('Error fetching children:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get a child by its ID
exports.getEnfantById = async (req, res) => {
    const enfantId = req.params.id;

    try {
        const [result] = await db.query("SELECT * FROM Enfants WHERE id = ?", [enfantId]);
        if (result.length === 0) {
            return res.status(404).json({ message: "Enfant non trouvé" });
        }
        res.json(result[0]); // Retourne le premier enfant trouvé
    } catch (err) {
        console.error('Error fetching child by ID:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Update the information about a child
exports.updateEnfant = async (req, res) => {
    const enfantId = req.params.id;
    const {
        Nom,
        Prenom,
        CODE,
        date_naissance,
        age_premier_contact,
        SEXE,
        NomMere,
        NomPere,
        Domicile,
        Fokotany,
        Hameau,
        Telephone,
    } = req.body;

    const query = `
        UPDATE Enfants 
        SET Nom = ?, Prenom = ?, CODE = ?, date_naissance = ?, age_premier_contact = ?, 
        SEXE = ?, NomMere = ?, NomPere = ?, Domicile = ?, Fokotany = ?, Hameau = ?, Telephone = ? 
        WHERE id = ?
    `;

    try {
        const [result] = await db.query(query, [
            Nom,
            Prenom,
            CODE,
            date_naissance,
            age_premier_contact,
            SEXE,
            NomMere,
            NomPere,
            Domicile,
            Fokotany,
            Hameau,
            Telephone,
            enfantId,
        ]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Enfant non trouvé" });
        }
        res.json({ message: "Enfant mis à jour avec succès" });
    } catch (err) {
        console.error('Error updating child:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Delete a child from the list
exports.deleteEnfant = async (req, res) => {
    const enfantId = req.params.id;

    try {
        const [result] = await db.query("DELETE FROM Enfants WHERE id = ?", [enfantId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Enfant non trouvé" });
        }
        res.json({ message: "Enfant supprimé avec succès" });
    } catch (err) {
        console.error('Error deleting child:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
