const db = require('../config/db'); // Pool MySQL compatible avec les promesses

// Create a new Fokotany
exports.createFokotany = async (req, res) => {
    const sql = `
        INSERT INTO Fokotany (
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
            message: "Fokotany ajouté avec succès",
            id: result.insertId,
        });
    } catch (err) {
        console.error('Error details:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    }
};

// Get all Fokotany
exports.getAllFokotany = async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM Fokotany");
        res.json(results);
    } catch (err) {
        console.error('Error fetching Fokotany:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get a Fokotany by its ID
exports.getFokotanyById = async (req, res) => {
    const fokotanyId = req.params.id;

    try {
        const [result] = await db.query("SELECT * FROM Fokotany WHERE ID = ?", [fokotanyId]);
        if (result.length === 0) {
            return res.status(404).json({ message: "Fokotany non trouvé" });
        }
        res.json(result[0]); // Retourne uniquement le premier fokotany trouvé
    } catch (err) {
        console.error('Error fetching Fokotany by ID:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Update a Fokotany
exports.updateFokotany = async (req, res) => {
    const fokotanyId = req.params.id;
    const { Nom, px, py } = req.body;

    const query = `
        UPDATE Fokotany 
        SET Nom = ?, px = ?, py = ? 
        WHERE ID = ?
    `;

    try {
        const [result] = await db.query(query, [Nom, px, py, fokotanyId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Fokotany non trouvé" });
        }
        res.json({ message: "Fokotany mis à jour avec succès" });
    } catch (err) {
        console.error('Error updating Fokotany:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Delete a Fokotany
exports.deleteFokotany = async (req, res) => {
    const fokotanyId = req.params.id;

    try {
        const [result] = await db.query("DELETE FROM Fokotany WHERE ID = ?", [fokotanyId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Fokotany non trouvé" });
        }
        res.json({ message: "Fokotany supprimé avec succès" });
    } catch (err) {
        console.error('Error deleting Fokotany:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
