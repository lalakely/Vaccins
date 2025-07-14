const db = require('../config/db');
const notificationsController = require('./notificationsController');

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
        
        // Récupérer les informations de l'enfant pour la notification
        const [enfantInfo] = await db.query(`
            SELECT e.*, p.Nom as parent_nom, p.Prenom as parent_prenom
            FROM Enfants e
            LEFT JOIN Parents p ON e.parent_id = p.id
            WHERE e.id = ?
        `, [req.body.enfant_id]);
        
        if (enfantInfo && enfantInfo.length > 0) {
            try {
                // Créer une notification pour l'administrateur
                await notificationsController.createSystemNotification(
                    req.user?.id, // ID de l'utilisateur qui a effectué la vaccination (s'il existe)
                    "Vaccination effectuée",
                    `${newVaccination[0].name} administré à ${enfantInfo[0].Prenom} ${enfantInfo[0].Nom}`,
                    "success",
                    "vaccination_alert",
                    `/Personnes?id=${req.body.enfant_id}`,
                    "enfant",
                    req.body.enfant_id
                );
                
                // Créer une notification globale pour les statistiques
                await notificationsController.createSystemNotification(
                    null, // Notification globale (pour tous les utilisateurs)
                    "Statistique de vaccination",
                    `Une nouvelle vaccination a été enregistrée : ${newVaccination[0].name}`,
                    "info",
                    "statistics",
                    "/dashboard"
                );
                
                console.log('Notifications de vaccination créées avec succès');
            } catch (notifError) {
                // Ne pas bloquer le processus si la création de notification échoue
                console.error('Erreur lors de la création des notifications :', notifError);
                // La vaccination a été enregistrée, donc on continue
            }
        }

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