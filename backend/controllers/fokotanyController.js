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

// Count children in a Fokotany
exports.countEnfantsInFokotany = async (req, res) => {
    const fokotanyId = req.params.id;

    try {
        // Vérifier d'abord si le fokotany existe
        const [fokotanyResult] = await db.query("SELECT * FROM Fokotany WHERE ID = ?", [fokotanyId]);
        
        if (fokotanyResult.length === 0) {
            return res.status(404).json({ message: "Fokotany non trouvé" });
        }

        // Récupérer le nom du fokotany pour la requête
        const fokotanyNom = fokotanyResult[0].Nom;

        // Compter les enfants dans ce fokotany
        const [countResult] = await db.query(
            "SELECT COUNT(*) as count FROM Enfants WHERE Fokotany = ?", 
            [fokotanyNom]
        );

        res.json({ count: countResult[0].count });
    } catch (err) {
        console.error('Error counting children in Fokotany:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    }
};

// Count vaccinated children in a Fokotany
exports.countVaccinatedEnfantsInFokotany = async (req, res) => {
    const fokotanyId = req.params.id;

    try {
        // Vérifier d'abord si le fokotany existe
        const [fokotanyResult] = await db.query("SELECT * FROM Fokotany WHERE ID = ?", [fokotanyId]);
        
        if (fokotanyResult.length === 0) {
            return res.status(404).json({ message: "Fokotany non trouvé" });
        }

        // Récupérer le nom du fokotany pour la requête
        const fokotanyNom = fokotanyResult[0].Nom;

        // Compter le nombre total d'enfants dans ce fokotany
        const [totalResult] = await db.query(
            "SELECT COUNT(*) as total FROM Enfants WHERE Fokotany = ?", 
            [fokotanyNom]
        );

        // Compter les enfants vaccinés dans ce fokotany
        // Un enfant est considéré comme vacciné s'il a au moins un vaccin administré
        const [vaccinatedResult] = await db.query(
            `SELECT COUNT(DISTINCT e.ID) as vaccinated 
             FROM Enfants e 
             JOIN Vaccinations v ON e.ID = v.enfant_id 
             WHERE e.Fokotany = ? AND v.statut = 'administré'`, 
            [fokotanyNom]
        );

        const total = totalResult[0].total;
        const vaccinated = vaccinatedResult[0].vaccinated;
        const percentage = total > 0 ? Math.round((vaccinated / total) * 100) : 0;

        res.json({ 
            total, 
            vaccinated, 
            percentage 
        });
    } catch (err) {
        console.error('Error counting vaccinated children in Fokotany:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    }
};

// Get vaccination statistics for a Fokotany
exports.getFokotanyStats = async (req, res) => {
    const fokotanyId = req.params.id;

    try {
        // Vérifier d'abord si le fokotany existe
        const [fokotanyResult] = await db.query("SELECT * FROM Fokotany WHERE ID = ?", [fokotanyId]);
        
        if (fokotanyResult.length === 0) {
            return res.status(404).json({ message: "Fokotany non trouvé" });
        }

        // Récupérer le nom du fokotany pour la requête
        const fokotanyNom = fokotanyResult[0].Nom;

        // Compter le nombre total d'enfants dans ce fokotany
        const [totalResult] = await db.query(
            "SELECT COUNT(*) as total FROM Enfants WHERE Fokotany = ?", 
            [fokotanyNom]
        );

        // Compter les enfants vaccinés dans ce fokotany
        // Un enfant est considéré comme vacciné s'il a au moins un vaccin administré
        const [vaccinatedResult] = await db.query(
            `SELECT COUNT(DISTINCT e.ID) as vaccinated 
             FROM Enfants e 
             JOIN Vaccinations v ON e.ID = v.enfant_id 
             WHERE e.Fokotany = ? AND v.statut = 'administré'`, 
            [fokotanyNom]
        );

        const total_enfants = totalResult[0].total;
        const enfants_vaccines = vaccinatedResult[0].vaccinated;

        res.json({ 
            total_enfants, 
            enfants_vaccines
        });
    } catch (err) {
        console.error('Error getting Fokotany stats:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    }
};

// Get vaccinations for a Fokotany
exports.getFokotanyVaccinations = async (req, res) => {
    const fokotanyId = req.params.id;

    try {
        // Vérifier d'abord si le fokotany existe
        const [fokotanyResult] = await db.query("SELECT * FROM Fokotany WHERE ID = ?", [fokotanyId]);
        
        if (fokotanyResult.length === 0) {
            return res.status(404).json({ message: "Fokotany non trouvé" });
        }

        // Récupérer le nom du fokotany pour la requête
        const fokotanyNom = fokotanyResult[0].Nom;

        // Récupérer toutes les vaccinations pour les enfants de ce fokotany
        const [vaccinations] = await db.query(
            `SELECT v.* 
             FROM Vaccinations v
             JOIN Enfants e ON v.enfant_id = e.ID
             WHERE e.Fokotany = ?`, 
            [fokotanyNom]
        );

        res.json(vaccinations);
    } catch (err) {
        console.error('Error getting Fokotany vaccinations:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    }
};
