const db = require('../config/db'); // Pool MySQL compatible avec les promesses

// Create a new Hameau
exports.createHameau = async (req, res) => {
    const sql = `
        INSERT INTO Hameau (
            Nom, px, py
        ) VALUES (?, ?, ?)
    `;

    const values = [
        req.body.Nom,
        req.body.px,
        req.body.py,
    ];

    try {
        console.log('SQL:', sql);
        console.log('Values:', values);

        const [result] = await db.query(sql, values);
        res.status(201).json({
            message: "Hameau ajouté avec succès",
            id: result.insertId,
        });
    } catch (err) {
        console.error('Error details:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    }
};

// Get all Hameau
exports.getAllHameau = async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM Hameau");
        res.json(results);
    } catch (err) {
        console.error('Error fetching Hameau:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get a Hameau by its ID
exports.getHameauById = async (req, res) => {
    const hameauId = req.params.id;

    try {
        const [result] = await db.query("SELECT * FROM Hameau WHERE id = ?", [hameauId]);
        if (result.length === 0) {
            return res.status(404).json({ message: "Hameau non trouvé" });
        }
        res.json(result[0]); // Retourne uniquement le premier hameau trouvé
    } catch (err) {
        console.error('Error fetching Hameau by ID:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Update a Hameau
exports.updateHameau = async (req, res) => {
    const hameauId = req.params.id;
    const { Nom, px, py } = req.body;

    const query = `
        UPDATE Hameau 
        SET Nom = ?, px = ?, py = ? 
        WHERE id = ?
    `;

    try {
        const [result] = await db.query(query, [Nom, px, py, hameauId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Hameau non trouvé" });
        }
        res.json({ message: "Hameau mis à jour avec succès" });
    } catch (err) {
        console.error('Error updating Hameau:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Delete a Hameau
exports.deleteHameau = async (req, res) => {
    const hameauId = req.params.id;

    try {
        const [result] = await db.query("DELETE FROM Hameau WHERE id = ?", [hameauId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Hameau non trouvé" });
        }
        res.json({ message: "Hameau supprimé avec succès" });
    } catch (err) {
        console.error('Error deleting Hameau:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
