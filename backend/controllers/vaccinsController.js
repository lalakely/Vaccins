const db = require('../config/db'); // Pool MySQL compatible avec les promesses

// Create a new Vaccine
exports.createVaccin = async (req, res) => {
    // Démarrer la transaction
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // 1. Insérer le vaccin principal
        const sql = `
            INSERT INTO Vaccins (
                Nom, Duree, Date_arrivee, Date_peremption, Description,
                Age_Annees, Age_Mois, Age_Jours
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            req.body.Nom,
            req.body.Duree,
            req.body.Date_arrivee,
            req.body.Date_peremption,
            req.body.Description,
            req.body.Age_Annees || 0,
            req.body.Age_Mois || 0,
            req.body.Age_Jours || 0
        ];

        console.log('SQL :', sql);
        console.log('Values :', values);

        const [result] = await connection.query(sql, values);
        const newVaccinId = result.insertId;
        
        // 2. Insérer les vaccins prérequis s'ils existent
        if (req.body.PrerequisVaccins && Array.isArray(req.body.PrerequisVaccins) && req.body.PrerequisVaccins.length > 0) {
            const prerequisSql = `
                INSERT INTO VaccinPrerequis (vaccin_id, prerequis_id, strict)
                VALUES (?, ?, ?)
            `;
            
            // Création des enregistrements de prérequis pour chaque vaccin prérequis
            for (const prereq of req.body.PrerequisVaccins) {
                // Vérifier si c'est un objet avec id et strict, ou juste un ID
                const prerequisId = typeof prereq === 'object' ? prereq.id : prereq;
                const isStrict = typeof prereq === 'object' ? !!prereq.strict : false;
                
                await connection.query(prerequisSql, [newVaccinId, prerequisId, isStrict]);
            }
            
            console.log(`Ajouté ${req.body.PrerequisVaccins.length} vaccins prérequis`);
        }
        
        // 3. Insérer les vaccins suites s'ils existent
        if (req.body.SuiteVaccins && Array.isArray(req.body.SuiteVaccins) && req.body.SuiteVaccins.length > 0) {
            // Vérifier si nous avons des objets complexes ou de simples IDs
            const hasComplexObjects = req.body.SuiteVaccins.some(suite => typeof suite === 'object' && suite !== null);
            
            if (hasComplexObjects) {
                // Nouvelle version avec champs supplémentaires
                const suiteSql = `
                    INSERT INTO VaccinSuite (vaccin_id, suite_id, type, delai, strict, description)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                
                // Création des enregistrements de suite pour chaque vaccin suivant
                for (const suite of req.body.SuiteVaccins) {
                    // Gérer le cas spécial des rappels (id = -1)
                    const suiteId = suite.id === -1 ? newVaccinId : suite.id;
                    const type = suite.type || (suite.strict ? 'strict' : 'recommande');
                    const delai = suite.delai || 0;
                    const strict = suite.strict || false;
                    const description = suite.description || null;
                    
                    console.log('Insertion suite:', { newVaccinId, suiteId, type, delai, strict, description });
                    await connection.query(suiteSql, [newVaccinId, suiteId, type, delai, strict, description]);
                }
            } else {
                // Ancienne version avec simples IDs
                const suiteSql = `
                    INSERT INTO VaccinSuite (vaccin_id, suite_id)
                    VALUES (?, ?)
                `;
                
                // Création des enregistrements de suite pour chaque vaccin suivant
                for (const suiteId of req.body.SuiteVaccins) {
                    await connection.query(suiteSql, [newVaccinId, suiteId]);
                }
            }
            
            console.log(`Ajouté ${req.body.SuiteVaccins.length} vaccins suite`);
        }
        
        // 4. Insérer les rappels s'ils existent (pour compatibilité avec l'ancienne version)
        if (req.body.Rappels && Array.isArray(req.body.Rappels) && req.body.Rappels.length > 0) {
            const rappelSql = `
                INSERT INTO VaccinSuite (vaccin_id, suite_id, type, delai, strict)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            // Création des enregistrements de rappel
            for (const rappel of req.body.Rappels) {
                await connection.query(rappelSql, [newVaccinId, newVaccinId, 'rappel', rappel.delai || 0, true]);
            }
            
            console.log(`Ajouté ${req.body.Rappels.length} rappels`);
        }
        
        // Validation de la transaction
        await connection.commit();
        
        res.status(201).json({
            message: "Vaccin ajouté avec succès",
            id: newVaccinId,
        });
    } catch (err) {
        // Annulation en cas d'erreur
        await connection.rollback();
        console.error('Error details :', err);
        res.status(500).json(err);
    } finally {
        // Libération de la connexion
        connection.release();
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

// Get prerequisites for a specific vaccine
exports.getVaccinPrerequisites = async (req, res) => {
    const vaccinId = req.params.id;
    
    try {
        const [results] = await db.query(
            `SELECT v.*, vp.strict 
             FROM Vaccins v 
             JOIN VaccinPrerequis vp ON v.id = vp.prerequis_id 
             WHERE vp.vaccin_id = ?`, 
            [vaccinId]
        );
        
        res.json(results);
    } catch (err) {
        console.error('Error fetching vaccine prerequisites:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get vaccines that require this vaccine as a prerequisite
exports.getVaccinsRequiringThis = async (req, res) => {
    const prerequisId = req.params.id;
    
    try {
        const [results] = await db.query(
            `SELECT v.* 
             FROM Vaccins v 
             JOIN VaccinPrerequis vp ON v.id = vp.vaccin_id 
             WHERE vp.prerequis_id = ?`, 
            [prerequisId]
        );
        
        res.json(results);
    } catch (err) {
        console.error('Error fetching vaccines requiring this prerequisite:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get vaccines that should follow a specific vaccine (suites)
exports.getVaccinSuites = async (req, res) => {
    const vaccinId = req.params.id;
    
    try {
        // Trouver les vaccins qui doivent suivre ce vaccin avec leurs attributs strict et delai
        const [results] = await db.query(
            `SELECT v.*, vs.strict, vs.delai, vs.type 
             FROM Vaccins v 
             JOIN VaccinSuite vs ON v.id = vs.suite_id 
             WHERE vs.vaccin_id = ? AND (vs.type IS NULL OR vs.type != 'rappel')`, 
            [vaccinId]
        );
        
        res.json(results);
    } catch (err) {
        console.error('Error fetching vaccine suites:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get rappels for a specific vaccine
exports.getVaccinRappels = async (req, res) => {
    const vaccinId = req.params.id;
    
    try {
        // Récupérer les rappels du vaccin (suites de type 'rappel')
        const [results] = await db.query(
            `SELECT delai, description 
             FROM VaccinSuite 
             WHERE vaccin_id = ? AND suite_id = ? AND type = 'rappel'`, 
            [vaccinId, vaccinId]
        );
        
        res.json(results);
    } catch (err) {
        console.error('Error fetching vaccine rappels:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get vaccines for which this vaccine is a suite
exports.getVaccinPreSuites = async (req, res) => {
    const suiteId = req.params.id;
    
    try {
        // Trouver les vaccins pour lesquels ce vaccin est une suite
        const [results] = await db.query(
            `SELECT v.* 
             FROM Vaccins v 
             JOIN VaccinSuite vs ON v.id = vs.vaccin_id 
             WHERE vs.suite_id = ?`, 
            [suiteId]
        );
        
        res.json(results);
    } catch (err) {
        console.error('Error fetching vaccines for which this is a suite:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get a Vaccine by its ID with its prerequisites
exports.getVaccinById = async (req, res) => {
    const vaccinId = req.params.id;

    try {
        // Récupérer les informations du vaccin
        const [vaccin] = await db.query("SELECT * FROM Vaccins WHERE id = ?", [vaccinId]);
        if (vaccin.length === 0) {
            return res.status(404).send("Vaccin Non trouvé");
        }
        
        // Récupérer les prérequis du vaccin
        const [prerequis] = await db.query(
            `SELECT v.* 
             FROM Vaccins v 
             JOIN VaccinPrerequis vp ON v.id = vp.prerequis_id 
             WHERE vp.vaccin_id = ?`, 
            [vaccinId]
        );
        
        // Combiner les informations
        const result = vaccin[0];
        result.prerequis = prerequis;
        
        res.json(result);
    } catch (err) {
        console.error('Error fetching vaccine by ID with prerequisites:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Delete a Vaccine
exports.deleteVaccin = async (req, res) => {
    const vaccinId = req.params.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        
        // Les enregistrements dans VaccinPrerequis seront automatiquement supprimés grâce à ON DELETE CASCADE
        const [result] = await connection.query("DELETE FROM Vaccins WHERE id = ?", [vaccinId]);
        if (result.affectedRows === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).send("Vaccin non trouvé");
        }
        
        await connection.commit();
        res.send("Vaccin supprimé avec succès");
    } catch (err) {
        await connection.rollback();
        console.error('Error deleting vaccine:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    } finally {
        connection.release();
    }
};

// Update a Vaccine
exports.updateVaccin = async (req, res) => {
    const vaccinId = req.params.id;
    const { Nom, Duree, Date_arrivee, Date_peremption, Description, PrerequisVaccins, SuiteVaccins, Age_Annees, Age_Mois, Age_Jours, Rappels } = req.body;
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Mettre à jour le vaccin
        const query = `
            UPDATE Vaccins 
            SET Nom = ?, Duree = ?, Date_arrivee = ?, Date_peremption = ?, Description = ?,
            Age_Annees = ?, Age_Mois = ?, Age_Jours = ?
            WHERE id = ?
        `;

        const [result] = await connection.query(query, [
            Nom, Duree, Date_arrivee, Date_peremption, Description, 
            Age_Annees || 0, Age_Mois || 0, Age_Jours || 0, 
            vaccinId
        ]);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).send("Vaccin non trouvé");
        }
        
        // 2. Gérer les prérequis si fournis
        if (PrerequisVaccins !== undefined) {
            // 2.1 Supprimer les anciens prérequis
            await connection.query('DELETE FROM VaccinPrerequis WHERE vaccin_id = ?', [vaccinId]);
            
            // 2.2 Ajouter les nouveaux prérequis
            if (Array.isArray(PrerequisVaccins) && PrerequisVaccins.length > 0) {
                const prerequisSql = `
                    INSERT INTO VaccinPrerequis (vaccin_id, prerequis_id, strict)
                    VALUES (?, ?, ?)
                `;
                
                for (const prereq of PrerequisVaccins) {
                    // Vérifier si c'est un objet avec id et strict, ou juste un ID
                    const prerequisId = typeof prereq === 'object' ? prereq.id : prereq;
                    const isStrict = typeof prereq === 'object' ? !!prereq.strict : false;
                    
                    await connection.query(prerequisSql, [vaccinId, prerequisId, isStrict]);
                }
                
                console.log(`Mis à jour avec ${PrerequisVaccins.length} vaccins prérequis`);
            }
        }
        
        // 3. Gérer les vaccins suites et rappels si fournis
        if (SuiteVaccins !== undefined) {
            // 3.1 Supprimer les anciennes suites et rappels
            await connection.query('DELETE FROM VaccinSuite WHERE vaccin_id = ?', [vaccinId]);
            
            // 3.2 Ajouter les nouvelles suites
            if (Array.isArray(SuiteVaccins) && SuiteVaccins.length > 0) {
                const suiteSql = `
                    INSERT INTO VaccinSuite (vaccin_id, suite_id, type, delai, strict, description)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                
                for (const suite of SuiteVaccins) {
                    // Déterminer si nous avons un objet complet ou juste un id
                    if (typeof suite === 'object') {
                        const suiteId = suite.id === -1 ? vaccinId : suite.id;
                        const type = suite.type || (suite.strict ? 'strict' : 'recommande');
                        const delai = suite.delai || 0;
                        const isStrict = !!suite.strict;
                        const description = suite.description || null;
                        
                        await connection.query(suiteSql, [vaccinId, suiteId, type, delai, isStrict, description]);
                    } else {
                        // Cas simple avec juste un ID
                        await connection.query(suiteSql, [vaccinId, suite, 'recommande', 0, false, null]);
                    }
                }
                
                console.log(`Mis à jour avec ${SuiteVaccins.length} vaccins suite`);
            }
        }
        
        // 4. Gérer les rappels séparément si fournis (pour compatibilité avec l'ancienne version)
        if (Rappels !== undefined && Array.isArray(Rappels) && Rappels.length > 0) {
            // Les rappels sont déjà inclus dans SuiteVaccins, mais nous les traitons séparément ici
            // pour le cas où seuls les rappels sont fournis sans SuiteVaccins
            if (SuiteVaccins === undefined) {
                const rappelSql = `
                    INSERT INTO VaccinSuite (vaccin_id, suite_id, type, delai, strict, description)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                
                for (const rappel of Rappels) {
                    await connection.query(rappelSql, [
                        vaccinId, 
                        vaccinId, 
                        'rappel', 
                        rappel.delai || 0, 
                        true, 
                        rappel.description || null
                    ]);
                }
                
                console.log(`Mis à jour avec ${Rappels.length} rappels`);
            }
        }
        
        await connection.commit();
        res.send("Vaccin mis à jour");
    } catch (err) {
        await connection.rollback();
        console.error('Error updating vaccine:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    } finally {
        connection.release();
    }
};
