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

// Count children in a Hameau
exports.countEnfantsInHameau = async (req, res) => {
    const hameauId = req.params.id;

    try {
        // Vérifier d'abord si le hameau existe
        const [hameauResult] = await db.query("SELECT * FROM Hameau WHERE id = ?", [hameauId]);
        
        if (hameauResult.length === 0) {
            return res.status(404).json({ message: "Hameau non trouvé" });
        }

        // Récupérer le nom du hameau pour la requête
        const hameauNom = hameauResult[0].Nom;

        // Compter les enfants dans ce hameau
        const [countResult] = await db.query(
            "SELECT COUNT(*) as count FROM Enfants WHERE Hameau = ?", 
            [hameauNom]
        );

        res.json({ count: countResult[0].count });
    } catch (err) {
        console.error('Error counting children in Hameau:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    }
};

// Count vaccinated children in a Hameau
exports.countVaccinatedEnfantsInHameau = async (req, res) => {
    const hameauId = req.params.id;

    try {
        // Vérifier d'abord si le hameau existe
        const [hameauResult] = await db.query("SELECT * FROM Hameau WHERE id = ?", [hameauId]);
        
        if (hameauResult.length === 0) {
            return res.status(404).json({ message: "Hameau non trouvé" });
        }

        // Récupérer le nom du hameau pour la requête
        const hameauNom = hameauResult[0].Nom;

        // Compter le nombre total d'enfants dans ce hameau
        const [totalResult] = await db.query(
            "SELECT COUNT(*) as total FROM Enfants WHERE Hameau = ?", 
            [hameauNom]
        );

        // Compter les enfants vaccinés dans ce hameau
        // Un enfant est considéré comme vacciné s'il a au moins un vaccin administré
        const [vaccinatedResult] = await db.query(
            `SELECT COUNT(DISTINCT e.ID) as vaccinated 
             FROM Enfants e 
             JOIN Vaccinations v ON e.ID = v.enfant_id 
             WHERE e.Hameau = ?`, 
            [hameauNom]
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
        console.error('Error counting vaccinated children in Hameau:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    }
};

// Get vaccination statistics for a Hameau
exports.getHameauStats = async (req, res) => {
    const hameauId = req.params.id;

    try {
        // Vérifier d'abord si le hameau existe
        const [hameauResult] = await db.query("SELECT * FROM Hameau WHERE id = ?", [hameauId]);
        
        if (hameauResult.length === 0) {
            return res.status(404).json({ message: "Hameau non trouvé" });
        }

        // Récupérer le nom du hameau pour la requête
        const hameauNom = hameauResult[0].Nom;

        // Compter le nombre total d'enfants dans ce hameau
        const [totalResult] = await db.query(
            "SELECT COUNT(*) as total FROM Enfants WHERE Hameau = ?", 
            [hameauNom]
        );

        // Compter les enfants vaccinés dans ce hameau
        // Un enfant est considéré comme vacciné s'il a au moins un vaccin administré
        const [vaccinatedResult] = await db.query(
            `SELECT COUNT(DISTINCT e.ID) as vaccinated 
             FROM Enfants e 
             JOIN Vaccinations v ON e.ID = v.enfant_id 
             WHERE e.Hameau = ?`, 
            [hameauNom]
        );

        const total_enfants = totalResult[0].total;
        const enfants_vaccines = vaccinatedResult[0].vaccinated;

        res.json({ 
            total_enfants, 
            enfants_vaccines
        });
    } catch (err) {
        console.error('Error getting Hameau stats:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    }
};

// Get vaccinations for a Hameau
exports.getHameauVaccinations = async (req, res) => {
    const hameauId = req.params.id;

    try {
        // Vérifier d'abord si le hameau existe
        const [hameauResult] = await db.query("SELECT * FROM Hameau WHERE id = ?", [hameauId]);
        
        if (hameauResult.length === 0) {
            return res.status(404).json({ message: "Hameau non trouvé" });
        }

        // Récupérer le nom du hameau pour la requête
        const hameauNom = hameauResult[0].Nom;

        // Récupérer toutes les vaccinations pour les enfants de ce hameau
        const [vaccinations] = await db.query(
            `SELECT v.* 
             FROM Vaccinations v
             JOIN Enfants e ON v.enfant_id = e.ID
             WHERE e.Hameau = ?`, 
            [hameauNom]
        );

        res.json(vaccinations);
    } catch (err) {
        console.error('Error getting Hameau vaccinations:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    }
};
