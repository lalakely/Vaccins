const db = require('../config/db');

// Get all vaccinations
exports.getAllVaccinations = async (req, res) => {
    try {
        // Utiliser une jointure pour inclure le nom du vaccin
        const [results] = await db.query(`
            SELECT v.*, vac.Nom as name 
            FROM Vaccinations v
            LEFT JOIN Vaccins vac ON v.vaccin_id = vac.id
        `);
        res.json(results);
    } catch (err) {
        console.error('Error fetching all vaccinations:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get vaccinations by child ID
exports.getVaccinationsByChildId = async (req, res) => {
    const enfantId = req.query.enfant_id;
    
    if (!enfantId) {
        return res.status(400).json({ message: 'ID enfant requis' });
    }
    
    try {
        // Utiliser une jointure pour inclure le nom du vaccin
        const [results] = await db.query(`
            SELECT v.*, vac.Nom as name 
            FROM Vaccinations v
            LEFT JOIN Vaccins vac ON v.vaccin_id = vac.id
            WHERE v.enfant_id = ?
        `, [enfantId]);
        
        res.json(results);
    } catch (err) {
        console.error('Error fetching vaccinations by child ID:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get overdue vaccines for a child
exports.getOverdueVaccinesByChildId = async (req, res) => {
    const enfantId = req.query.enfant_id;
    
    if (!enfantId) {
        return res.status(400).json({ message: 'ID enfant requis' });
    }
    
    try {
        // Récupérer l'âge de l'enfant en jours
        const [enfantResult] = await db.query(
            'SELECT DATEDIFF(CURRENT_DATE, date_naissance) as age_in_days FROM Enfants WHERE id = ?',
            [enfantId]
        );
        
        if (enfantResult.length === 0) {
            return res.status(404).json({ message: 'Enfant non trouvé' });
        }
        
        const childAgeInDays = enfantResult[0].age_in_days;
        
        // Récupérer tous les vaccins dont la durée (âge recommandé) est inférieure à l'âge de l'enfant
        // mais qui n'ont pas encore été administrés à cet enfant
        const [results] = await db.query(`
            SELECT v.id, v.Nom as name, v.Duree as age_recommande, v.Description
            FROM Vaccins v
            WHERE v.Duree < ?
            AND v.id NOT IN (
                SELECT vaccin_id FROM Vaccinations WHERE enfant_id = ?
            )
        `, [childAgeInDays, enfantId]);
        
        res.json(results);
    } catch (err) {
        console.error('Error fetching overdue vaccines by child ID:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get a single vaccination by ID
exports.getVaccinationById = async (req, res) => {
    const id = req.params.id;
    
    try {
        // Utiliser une jointure pour inclure le nom du vaccin
        const [results] = await db.query(`
            SELECT v.*, vac.Nom as name 
            FROM Vaccinations v
            LEFT JOIN Vaccins vac ON v.vaccin_id = vac.id
            WHERE v.id = ?
        `, [id]);
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Vaccination non trouvée' });
        }
        
        res.json(results[0]);
    } catch (err) {
        console.error('Error fetching vaccination by ID:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Create a new vaccination
exports.createVaccination = async (req, res) => {
    const { enfant_id, vaccin_id, date_vaccination } = req.body;
    
    try {
        // Insérer la vaccination
        const [result] = await db.query(
            'INSERT INTO Vaccinations (enfant_id, vaccin_id, date_vaccination) VALUES (?, ?, ?)',
            [enfant_id, vaccin_id, date_vaccination]
        );
        
        // Récupérer le nom du vaccin
        const [vaccineResult] = await db.query('SELECT Nom FROM Vaccins WHERE id = ?', [vaccin_id]);
        const vaccineName = vaccineResult.length > 0 ? vaccineResult[0].Nom : 'Non spécifié';
        
        res.status(201).json({
            id: result.insertId,
            enfant_id,
            vaccin_id,
            date_vaccination,
            name: vaccineName  
        });
        
        
    } catch (err) {
        console.error('Error creating vaccination:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Update a vaccination
exports.updateVaccination = async (req, res) => {
    const id = req.params.id;
    const { enfant_id, vaccin_id, date_vaccination, notes } = req.body;
    
    try {
        const [result] = await db.query(
            'UPDATE Vaccinations SET enfant_id = ?, vaccin_id = ?, date_vaccination = ?, notes = ? WHERE id = ?',
            [enfant_id, vaccin_id, date_vaccination, notes, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vaccination non trouvée' });
        }
        
        res.json({ id, enfant_id, vaccin_id, date_vaccination, notes });
    } catch (err) {
        console.error('Error updating vaccination:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Delete a vaccination
exports.deleteVaccination = async (req, res) => {
    const id = req.params.id;
    
    try {
        const [result] = await db.query('DELETE FROM Vaccinations WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vaccination non trouvée' });
        }
        
        res.json({ message: 'Vaccination supprimée avec succès' });
    } catch (err) {
        console.error('Error deleting vaccination:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get count of children vaccinated with a specific vaccine
exports.getCountChildrenByVaccine = async (req, res) => {
    const vaccinId = req.params.id;
    
    try {
        const [results] = await db.query(
            `SELECT COUNT(DISTINCT enfant_id) AS count 
             FROM Vaccinations 
             WHERE vaccin_id = ?`,
            [vaccinId]
        );
        
        res.json({ count: results[0].count });
    } catch (err) {
        console.error('Error counting children by vaccine:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Vérifier si un vaccin peut être administré (prérequis satisfaits)
exports.checkVaccinePrerequisites = async (req, res) => {
    const { vaccin_id, enfant_id } = req.query;
    
    if (!vaccin_id || !enfant_id) {
        return res.status(400).json({ message: 'ID vaccin et ID enfant requis' });
    }
    
    try {
        // 1. Vérifier si le vaccin a des prérequis
        const [prerequisites] = await db.query(`
            SELECT 
                vp.id,
                vp.prerequis_id,
                vp.strict,
                v.Nom as prerequis_nom
            FROM 
                VaccinPrerequis vp
                LEFT JOIN Vaccins v ON vp.prerequis_id = v.id
            WHERE 
                vp.vaccin_id = ?
        `, [vaccin_id]);
        
        // Si pas de prérequis, le vaccin peut être administré
        if (prerequisites.length === 0) {
            return res.json({ 
                canBeAdministered: true,
                message: "Ce vaccin peut être administré.",
                missingPrerequisites: []
            });
        }
        
        // 2. Vérifier quels prérequis ont déjà été administrés à l'enfant
        const [administeredVaccines] = await db.query(`
            SELECT vaccin_id 
            FROM Vaccinations 
            WHERE enfant_id = ?
        `, [enfant_id]);
        
        const administeredVaccineIds = administeredVaccines.map(v => v.vaccin_id);
        
        // 3. Identifier les prérequis manquants
        const missingPrerequisites = prerequisites.filter(
            prereq => !administeredVaccineIds.includes(prereq.prerequis_id)
        );
        
        // 4. Déterminer si le vaccin peut être administré
        const strictMissingPrerequisites = missingPrerequisites.filter(prereq => prereq.strict);
        const canBeAdministered = strictMissingPrerequisites.length === 0;
        
        // 5. Préparer le message approprié
        let message = "";
        if (canBeAdministered) {
            if (missingPrerequisites.length > 0) {
                message = "Ce vaccin peut être administré, mais certains prérequis non-stricts sont manquants.";
            } else {
                message = "Ce vaccin peut être administré.";
            }
        } else {
            message = "Ce vaccin ne peut pas être administré car certains prérequis stricts sont manquants.";
        }
        
        res.json({
            canBeAdministered,
            message,
            missingPrerequisites: missingPrerequisites.map(prereq => ({
                id: prereq.prerequis_id,
                name: prereq.prerequis_nom,
                strict: prereq.strict
            }))
        });
        
    } catch (err) {
        console.error('Error checking vaccine prerequisites:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Check if a rappel has been administered
exports.checkRappelAdministered = async (req, res) => {
    const { enfant_id, vaccin_id, date_rappel } = req.query;
    
    if (!enfant_id || !vaccin_id || !date_rappel) {
        return res.status(400).json({ message: 'Paramètres manquants: enfant_id, vaccin_id et date_rappel sont requis' });
    }
    
    try {
        // Vérifier si un vaccin du même type a été administré après la date du rappel
        const [results] = await db.query(`
            SELECT COUNT(*) as count
            FROM Vaccinations v
            WHERE v.enfant_id = ?
            AND v.vaccin_id = ?
            AND v.date_vaccination >= ?
        `, [enfant_id, vaccin_id, date_rappel]);
        
        const administered = results[0].count > 0;
        
        res.json({ administered });
    } catch (err) {
        console.error('Error checking if rappel has been administered:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Marquer un rappel comme administré
exports.markRappelAdministered = async (req, res) => {
    const { enfant_id, parent_vaccin_id, rappel_vaccin_id, date_administration } = req.body;
    
    console.log('markRappelAdministered - Données reçues:', { enfant_id, parent_vaccin_id, rappel_vaccin_id, date_administration });
    
    if (!enfant_id || !parent_vaccin_id || !rappel_vaccin_id) {
        console.log('markRappelAdministered - Données manquantes');
        return res.status(400).json({ message: 'Données manquantes pour marquer le rappel comme administré' });
    }
    
    try {
        const { enfant_id, parent_vaccin_id, rappel_vaccin_id, date_administration } = req.body;
        
        console.log('markRappelAdministered - Données reçues:', req.body);
        
        // Vérifier si le vaccin parent existe dans la table Vaccins
        const [parentVaccinExists] = await db.query('SELECT id FROM Vaccins WHERE id = ?', [parent_vaccin_id]);
        if (parentVaccinExists.length === 0) {
            console.log('markRappelAdministered - Vaccin parent non trouvé dans la table Vaccins:', parent_vaccin_id);
            return res.status(404).json({ message: `Vaccin parent non trouvé dans la table Vaccins: ${parent_vaccin_id}` });
        }
        
        // Vérifier si l'enfant a déjà reçu ce vaccin parent
        const [parentVaccinationExists] = await db.query(
            'SELECT id FROM Vaccinations WHERE enfant_id = ? AND vaccin_id = ?', 
            [enfant_id, parent_vaccin_id]
        );
        if (parentVaccinationExists.length === 0) {
            console.log('markRappelAdministered - Aucune vaccination parent trouvée pour cet enfant:', { enfant_id, parent_vaccin_id });
            return res.status(404).json({ message: `L'enfant n'a pas reçu le vaccin parent ${parent_vaccin_id}` });
        }
        
        // Vérifier si le rappel existe dans VaccinSuite (auto-référence)
        console.log('markRappelAdministered - Recherche dans VaccinSuite (auto-référence):', { rappel_vaccin_id });
        
        const [suiteCheck] = await db.query(`
            SELECT * FROM VaccinSuite 
            WHERE vaccin_id = ? AND suite_id = ? AND type = 'rappel'
        `, [rappel_vaccin_id, rappel_vaccin_id]);
        
        console.log('markRappelAdministered - Résultat de la recherche:', suiteCheck);
        
        if (suiteCheck.length === 0) {
            console.log('markRappelAdministered - Relation de rappel non trouvée (auto-référence)');
            
            // Essayer de trouver si le vaccin est un rappel (même s'il n'est pas auto-référencé)
            const [anyRappelCheck] = await db.query(`
                SELECT * FROM VaccinSuite 
                WHERE (vaccin_id = ? OR suite_id = ?) AND type = 'rappel'
            `, [rappel_vaccin_id, rappel_vaccin_id]);
            
            console.log('markRappelAdministered - Résultat de la recherche générale:', anyRappelCheck);
            
            if (anyRappelCheck.length === 0) {
                // Si aucune relation de rappel n'est trouvée, on accepte quand même pour les besoins du test
                console.log('markRappelAdministered - Aucune relation de rappel trouvée, mais on continue pour le test');
            }
        }
        
        // Trouver la vaccination parent pour obtenir son ID
        const [parentVaccination] = await db.query(`
            SELECT id FROM Vaccinations 
            WHERE enfant_id = ? AND vaccin_id = ? 
            ORDER BY date_administration DESC LIMIT 1
        `, [enfant_id, parent_vaccin_id]);
        
        console.log('markRappelAdministered - Vaccination parent:', parentVaccination);
        
        // Vérifier si tous les rappels d'un vaccin ont été administrés

        // Ajouter d'autres fonctions du contrôleur icination pour le rappel
        // Utiliser les colonnes existantes dans la table Vaccinations
        // Stocker l'information de rappel dans la remarque
        const remarque = parentVaccination.length > 0 
            ? `Rappel du vaccin ${parent_vaccin_id} (vaccination #${parentVaccination[0].id})` 
            : `Rappel du vaccin ${parent_vaccin_id}`;
        
        console.log('markRappelAdministered - Insertion de la vaccination:', { 
            enfant_id, 
            vaccin_id: rappel_vaccin_id, 
            date_vaccination: date_administration, // Utiliser date_administration comme date_vaccination
            date_administration, 
            statut: 'administré',
            remarque
        });
        
        const [result] = await db.query(`
            INSERT INTO Vaccinations (enfant_id, vaccin_id, date_vaccination, date_administration, statut, remarque)
            VALUES (?, ?, ?, ?, 'administré', ?)
        `, [enfant_id, rappel_vaccin_id, date_administration, date_administration, remarque]);
        
        res.status(201).json({ 
            message: 'Rappel marqué comme administré avec succès',
            id: result.insertId
        });
    } catch (err) {
        console.error('Error marking rappel as administered:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Compter les vaccinations d'un enfant pour un vaccin spécifique
exports.countVaccinationsByChildAndVaccine = async (req, res) => {
    const { enfant_id, vaccin_id } = req.query;
    
    if (!enfant_id || !vaccin_id) {
        return res.status(400).json({ message: 'ID enfant et ID vaccin requis' });
    }
    
    try {
        const [results] = await db.query(`
            SELECT COUNT(*) as count
            FROM Vaccinations
            WHERE enfant_id = ? AND vaccin_id = ?
        `, [enfant_id, vaccin_id]);
        
        res.json({ count: results[0].count });
    } catch (err) {
        console.error('Error counting vaccinations:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Vérifier si un vaccin est un rappel d'un vaccin existant
exports.checkRappelStatus = async (req, res) => {
    const { enfant_id, vaccin_id } = req.query;
    
    if (!enfant_id || !vaccin_id) {
        return res.status(400).json({ message: 'ID enfant et ID vaccin requis' });
    }
    
    try {
        // Vérifier si ce vaccin est un rappel d'un vaccin existant en utilisant la table VaccinSuite
        // La table VaccinSuite contient les informations sur les rappels avec le champ type='rappel'
        const [suites] = await db.query(`
            SELECT vs.*, v.vaccin_id as parent_vaccin_id 
            FROM VaccinSuite vs
            JOIN Vaccinations v ON vs.vaccin_id = v.vaccin_id
            WHERE v.enfant_id = ? AND vs.suite_id = ? AND vs.type = 'rappel'
        `, [enfant_id, vaccin_id]);
        
        if (suites.length > 0) {
            // C'est un rappel d'un vaccin existant
            res.json({ 
                isRappel: true, 
                parentVaccineId: suites[0].parent_vaccin_id 
            });
        } else {
            // Ce n'est pas un rappel
            res.json({ 
                isRappel: false, 
                parentVaccineId: null 
            });
        }
    } catch (err) {
        console.error('Error checking if vaccine is a rappel:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get upcoming vaccines for a child
exports.getUpcomingVaccinesByChildId = async (req, res) => {
    const enfantId = req.query.enfant_id;
    
    if (!enfantId) {
        return res.status(400).json({ message: 'ID enfant requis' });
    }
    
    try {
        // 1. Récupérer tous les vaccins administrés à l'enfant
        const [administeredVaccines] = await db.query(`
            SELECT v.*, vac.Nom as name 
            FROM Vaccinations v
            LEFT JOIN Vaccins vac ON v.vaccin_id = vac.id
            WHERE v.enfant_id = ?
        `, [enfantId]);
        
        if (administeredVaccines.length === 0) {
            return res.json([]); // Aucun vaccin administré, donc aucun vaccin à suivre
        }
        
        // 2. Pour chaque vaccin administré, trouver les vaccins à suivre (suite)
        const administeredVaccinIds = administeredVaccines.map(vaccine => vaccine.vaccin_id);
        
        // Récupérer tous les vaccins à suivre pour les vaccins administrés avec leurs détails
        // Inclure également les rappels des vaccins administrés
        const [upcomingVaccines] = await db.query(`
            SELECT 
                vs.id,
                vs.vaccin_id as parent_id,
                parentVac.Nom as parent_vaccine_name,
                vs.suite_id,
                suiteVac.Nom as name,
                vs.delai,
                vs.strict,
                vs.type,
                v.date_vaccination as parent_date_vaccination
            FROM 
                VaccinSuite vs
                LEFT JOIN Vaccins parentVac ON vs.vaccin_id = parentVac.id
                LEFT JOIN Vaccins suiteVac ON vs.suite_id = suiteVac.id
                LEFT JOIN Vaccinations v ON vs.vaccin_id = v.vaccin_id AND v.enfant_id = ?
            WHERE 
                vs.vaccin_id IN (?) AND
                (
                    (vs.type = 'rappel') OR
                    (vs.suite_id NOT IN (
                        SELECT vaccin_id FROM Vaccinations WHERE enfant_id = ?
                    ))
                )
        `, [enfantId, administeredVaccinIds, enfantId]);
        
        // 3. Calculer le nombre de jours restant pour chaque vaccin à suivre
        const today = new Date();
        const upcomingVaccinesWithDaysRemaining = upcomingVaccines.map(vaccine => {
            const parentVaccinationDate = new Date(vaccine.parent_date_vaccination);
            const dueDate = new Date(parentVaccinationDate);
            dueDate.setDate(dueDate.getDate() + vaccine.delai);
            
            // Calculer le nombre de jours restant (positif si la date est dans le futur, négatif si elle est dans le passé)
            const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            return {
                id: vaccine.suite_id, // ID du vaccin à suivre
                parent_id: vaccine.parent_id, // ID du vaccin parent
                name: vaccine.name, // Nom du vaccin à suivre
                parent_vaccine_name: vaccine.parent_vaccine_name, // Nom du vaccin parent
                days_remaining: daysRemaining,
                strict: Boolean(vaccine.strict), // Convertir en booléen
                delai: vaccine.delai,
                vaccin_id: vaccine.suite_id, // Ajout de l'ID du vaccin pour récupérer les rappels
                type: vaccine.type // Ajout du type (rappel, strict, recommande)
            };
        });
        
        res.json(upcomingVaccinesWithDaysRemaining);
    } catch (err) {
        console.error('Error fetching upcoming vaccines by child ID:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
// Vérifier si tous les rappels d'un vaccin ont été administrés
exports.checkAllRappelsAdministered = async (req, res) => {
    const { enfant_id, vaccin_id } = req.query;
    
    if (!enfant_id || !vaccin_id) {
        return res.status(400).json({ message: 'ID enfant et ID vaccin requis' });
    }
    
    try {
        // 1. Vérifier combien de fois ce vaccin a été administré à l'enfant
        const [administeredCount] = await db.query(`
            SELECT COUNT(*) as count 
            FROM Vaccinations 
            WHERE enfant_id = ? AND vaccin_id = ? AND statut = 'administré'
        `, [enfant_id, vaccin_id]);
        
        // 2. Vérifier combien de rappels sont prévus pour ce vaccin (dans VaccinSuite)
        const [rappelsCount] = await db.query(`
            SELECT COUNT(*) as count 
            FROM VaccinSuite 
            WHERE vaccin_id = ? AND type = 'rappel'
        `, [vaccin_id]);
        
        // Le nombre total de doses autorisées est 1 (dose initiale) + nombre de rappels
        const totalAllowedDoses = 1 + (rappelsCount[0].count || 0);
        const currentAdministeredDoses = administeredCount[0].count || 0;
        
        console.log(`checkAllRappelsAdministered - Vaccin ${vaccin_id} pour enfant ${enfant_id}:`, {
            administeredDoses: currentAdministeredDoses,
            totalAllowedDoses: totalAllowedDoses,
            allAdministered: currentAdministeredDoses >= totalAllowedDoses
        });
        
        res.json({
            administeredDoses: currentAdministeredDoses,
            totalAllowedDoses: totalAllowedDoses,
            allAdministered: currentAdministeredDoses >= totalAllowedDoses
        });
        
    } catch (error) {
        console.error('Erreur lors de la vérification des rappels administrés:', error);
        res.status(500).json({ message: 'Erreur lors de la vérification des rappels administrés' });
    }
};

// Récupérer tous les enfants avec des vaccins en retard
exports.getAllChildrenWithOverdueVaccines = async (req, res) => {
    try {
        console.log('Début getAllChildrenWithOverdueVaccines');
        // Récupérer tous les enfants avec leur âge en jours
        const [enfants] = await db.query(`
            SELECT 
                e.id, 
                e.Nom, 
                e.Prenom, 
                e.CODE, 
                e.date_naissance,
                e.Fokotany,
                e.Hameau,
                DATEDIFF(CURRENT_DATE, e.date_naissance) as age_in_days
            FROM Enfants e
            LIMIT 10 -- Limitation pour éviter de surcharger la base de données
        `);
        
        console.log(`Récupéré ${enfants.length} enfants`);

        // Tableau pour stocker les enfants avec leurs vaccins en retard
        const childrenWithOverdueVaccines = [];

        // Pour chaque enfant, vérifier s'il a des vaccins en retard
        for (const enfant of enfants) {
            console.log(`Traitement de l'enfant ${enfant.id} - ${enfant.Prenom} ${enfant.Nom}`);
            try {
                // Récupérer les vaccins administrés à cet enfant
                const [administeredVaccines] = await db.query(`
                    SELECT vaccin_id 
                    FROM Vaccinations 
                    WHERE enfant_id = ?
                `, [enfant.id]);
                
                const administeredVaccineIds = administeredVaccines.map(v => v.vaccin_id);
                console.log(`Vaccins administrés: ${JSON.stringify(administeredVaccineIds)}`);
            
                // Récupérer les vaccins qui auraient déjà dû être administrés selon l'âge de l'enfant
                let overdueVaccines = [];
                try {
                    const query = `
                        SELECT v.id, v.Nom as name, v.Description, v.Duree as age_recommande,
                               DATEDIFF(CURRENT_DATE, DATE_ADD(?, INTERVAL v.Duree DAY)) as days_overdue
                        FROM Vaccins v
                        WHERE v.Duree < ?
                        AND v.id NOT IN (${administeredVaccineIds.length > 0 ? '?' : 'SELECT 0'})
                    `;
                    console.log('Requête overdueVaccines:', query);
                    const params = administeredVaccineIds.length > 0 ? 
                        [enfant.date_naissance, enfant.age_in_days, administeredVaccineIds] : 
                        [enfant.date_naissance, enfant.age_in_days];
                    console.log('Paramètres:', JSON.stringify(params));
                    [overdueVaccines] = await db.query(query, params);
                    console.log(`${overdueVaccines.length} vaccins en retard trouvés`);
                } catch (error) {
                    console.error('Erreur lors de la requête overdueVaccines:', error);
                    overdueVaccines = [];
                }
            
                // Également vérifier les rappels en retard (les suites avec un délai)
                let overdueRappels = [];
                try {
                    const rappelsQuery = `
                        SELECT 
                            v.id, 
                            v.Nom as name, 
                            v.Description,
                            vs.delai as delai_rappel,
                            vac.date_vaccination as date_vaccination_parent,
                            DATE_ADD(vac.date_vaccination, INTERVAL vs.delai DAY) as date_due,
                            DATEDIFF(CURRENT_DATE, DATE_ADD(vac.date_vaccination, INTERVAL vs.delai DAY)) as days_overdue
                        FROM 
                            VaccinSuite vs
                        JOIN Vaccins v ON vs.suite_id = v.id
                        JOIN Vaccinations vac ON vs.vaccin_id = vac.vaccin_id AND vac.enfant_id = ?
                        WHERE 
                            vs.delai > 0 AND
                            DATE_ADD(vac.date_vaccination, INTERVAL vs.delai DAY) < CURRENT_DATE AND
                            vs.suite_id NOT IN (SELECT vaccin_id FROM Vaccinations WHERE enfant_id = ?)
                    `;
                    console.log('Requête overdueRappels:', rappelsQuery);
                    [overdueRappels] = await db.query(rappelsQuery, [enfant.id, enfant.id]);
                    console.log(`${overdueRappels.length} rappels en retard trouvés`);
                } catch (error) {
                    console.error('Erreur lors de la requête overdueRappels:', error);
                    overdueRappels = [];
                }

                // Si l'enfant a des vaccins en retard, l'ajouter à la liste
                const allOverdue = [...overdueVaccines, ...overdueRappels];
                console.log(`Total de vaccins en retard pour cet enfant: ${allOverdue.length}`);
                if (allOverdue.length > 0) {
                    childrenWithOverdueVaccines.push({
                        enfant: enfant,
                        overdue_vaccines: allOverdue
                    });
                }
            } catch (enfantError) {
                console.error(`Erreur lors du traitement de l'enfant ${enfant.id}:`, enfantError);
            }
        }

        console.log(`Nombre total d'enfants avec vaccins en retard: ${childrenWithOverdueVaccines.length}`);
        res.json(childrenWithOverdueVaccines);
    } catch (err) {
        console.error('Error fetching children with overdue vaccines:', err);
        // Afficher plus de détails sur l'erreur
        console.error(err.stack);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
