const db = require('../config/db');
const notificationsController = require('./notificationsController');

exports.createVaccination = async (req, res) => {
    // Démarrer une transaction pour s'assurer que les deux opérations (insertion vaccination et mise à jour stock) soient atomiques
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Vérifier d'abord que le stock du vaccin est suffisant
        const [vaccinInfo] = await connection.query(
            'SELECT Stock FROM Vaccins WHERE id = ?',
            [req.body.vaccin_id]
        );
        
        if (!vaccinInfo || vaccinInfo.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Vaccin non trouvé' });
        }
        
        // Vérifier que le stock est suffisant
        if (vaccinInfo[0].Stock <= 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ 
                message: 'Stock insuffisant pour ce vaccin', 
                stock: vaccinInfo[0].Stock 
            });
        }
        
        // 2. Insérer la vaccination
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

        console.log('SQL Vaccination:', sql);
        console.log('Values:', values);

        const [result] = await connection.query(sql, values);
        const newVaccinationId = result.insertId;
        
        // 3. Diminuer le stock du vaccin de 1 unité
        const updateStockSql = `
            UPDATE Vaccins 
            SET Stock = Stock - 1 
            WHERE id = ? AND Stock > 0
        `;
        
        const [updateResult] = await connection.query(updateStockSql, [req.body.vaccin_id]);
        
        if (updateResult.affectedRows === 0) {
            // Si aucune ligne n'est affectée, cela pourrait indiquer un problème
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: 'Impossible de mettre à jour le stock du vaccin' });
        }

        // Récupérer les données complètes de la vaccination ajoutée avec le nom du vaccin
        const [newVaccination] = await connection.query(`
            SELECT v.*, vacc.Nom as name 
            FROM Vaccinations v 
            JOIN Vaccins vacc ON v.vaccin_id = vacc.id 
            WHERE v.id = ?
        `, [newVaccinationId]);
        
        // Récupérer les informations de l'enfant pour la notification
        const [enfantInfo] = await connection.query(`
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

        // Valider la transaction
        await connection.commit();
        connection.release();
        
        res.status(201).json({
            ...newVaccination[0], 
            message: 'Vaccination enregistrée et stock diminué avec succès',
            stockRestant: vaccinInfo[0].Stock - 1
        });
    } catch (err) {
        // En cas d'erreur, annuler la transaction
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Error details :', err);
        res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la vaccination', error: err.message });
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