const db = require('../config/db');

// Récupérer l'historique des modifications pour un enfant spécifique
exports.getHistoryByChildId = async (req, res) => {
    const childId = req.params.id;

    try {
        const [results] = await db.query(
            `SELECT ch.*, u.username 
             FROM ChildHistory ch
             LEFT JOIN users u ON ch.user_id = u.id
             WHERE ch.child_id = ?
             ORDER BY ch.action_date DESC`,
            [childId]
        );
        
        // S'assurer que old_data et new_data sont des chaînes JSON valides
        const formattedResults = results.map(item => ({
            ...item,
            // Si old_data est un objet, le convertir en chaîne JSON
            old_data: item.old_data !== null ? 
                (typeof item.old_data === 'object' ? JSON.stringify(item.old_data) : item.old_data) : 
                null,
            // Si new_data est un objet, le convertir en chaîne JSON
            new_data: item.new_data !== null ? 
                (typeof item.new_data === 'object' ? JSON.stringify(item.new_data) : item.new_data) : 
                null
        }));
        
        res.json(formattedResults);
    } catch (err) {
        console.error('Error fetching child history:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Récupérer tout l'historique des modifications
exports.getAllHistory = async (req, res) => {
    try {
        // 1. Récupérer l'historique normal des modifications
        const [regularHistory] = await db.query(
            `SELECT 
                ch.id, 
                ch.child_id, 
                ch.action_type, 
                ch.action_date, 
                ch.user_id, 
                ch.old_data, 
                ch.new_data, 
                e.Nom, 
                e.Prenom, 
                u.username,
                'regular' as history_type
             FROM ChildHistory ch
             LEFT JOIN Enfants e ON ch.child_id = e.id
             LEFT JOIN users u ON ch.user_id = u.id`
        );
        
        // 2. Vérifier si la table DeletedChildrenLog existe
        let deletionLogs = [];
        try {
            // Vérifier si la table existe
            const [tableCheck] = await db.query(
                "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'csb' AND table_name = 'DeletedChildrenLog'"
            );
            
            // Si la table existe, récupérer les logs de suppression
            if (tableCheck[0].count > 0) {
                [deletionLogs] = await db.query(
                    `SELECT 
                        dcl.id, 
                        dcl.original_id as child_id, 
                        'DELETE' as action_type, 
                        dcl.action_date, 
                        dcl.user_id, 
                        dcl.child_data as old_data, 
                        NULL as new_data,
                        JSON_UNQUOTE(JSON_EXTRACT(dcl.child_data, '$.Nom')) as Nom,
                        JSON_UNQUOTE(JSON_EXTRACT(dcl.child_data, '$.Prenom')) as Prenom,
                        u.username,
                        'deletion' as history_type
                     FROM DeletedChildrenLog dcl
                     LEFT JOIN users u ON dcl.user_id = u.id`
                );
            } else {
                console.log("La table DeletedChildrenLog n'existe pas encore. Création de la table...");
                // Créer la table si elle n'existe pas
                await db.query(`
                    CREATE TABLE IF NOT EXISTS DeletedChildrenLog (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        original_id INT NOT NULL,
                        action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        user_id INT,
                        child_data JSON,
                        INDEX idx_deleted_children_original_id (original_id),
                        INDEX idx_deleted_children_action_date (action_date)
                    );
                `);
                console.log("Table DeletedChildrenLog créée avec succès.");
            }
        } catch (err) {
            console.error("Erreur lors de la vérification ou création de la table DeletedChildrenLog:", err);
            // Continuer avec un tableau vide pour les logs de suppression
            deletionLogs = [];
        }
        
        // 3. Combiner les deux ensembles de résultats
        const combinedResults = [...regularHistory, ...deletionLogs];
        
        // 4. Trier par date d'action (du plus récent au plus ancien)
        combinedResults.sort((a, b) => new Date(b.action_date) - new Date(a.action_date));
        
        // 5. Limiter à 100 résultats
        const limitedResults = combinedResults.slice(0, 100);
        
        // S'assurer que old_data et new_data sont des chaînes JSON valides
        const formattedResults = limitedResults.map(item => ({
            ...item,
            // Si old_data est un objet, le convertir en chaîne JSON
            old_data: item.old_data !== null ? 
                (typeof item.old_data === 'object' ? JSON.stringify(item.old_data) : item.old_data) : 
                null,
            // Si new_data est un objet, le convertir en chaîne JSON
            new_data: item.new_data !== null ? 
                (typeof item.new_data === 'object' ? JSON.stringify(item.new_data) : item.new_data) : 
                null
        }));
        
        res.json(formattedResults);
    } catch (err) {
        console.error('Error fetching all history:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Revert une modification
exports.revertChange = async (req, res) => {
    const historyId = req.params.id;
    
    try {
        // 1. Récupérer l'entrée d'historique
        const [historyEntries] = await db.query('SELECT * FROM ChildHistory WHERE id = ?', [historyId]);
        
        if (historyEntries.length === 0) {
            return res.status(404).json({ message: 'Entrée d\'historique non trouvée' });
        }
        
        const historyEntry = historyEntries[0];
        const childId = historyEntry.child_id;
        const actionType = historyEntry.action_type;
        
        // S'assurer que old_data est correctement parsé
        let oldDataStr = historyEntry.old_data;
        if (oldDataStr && typeof oldDataStr === 'object') {
            oldDataStr = JSON.stringify(oldDataStr);
        }
        const oldData = oldDataStr ? JSON.parse(oldDataStr) : null;
        
        // 2. Effectuer le revert en fonction du type d'action
        if (actionType === 'CREATE') {
            // D'abord, supprimer toutes les entrées d'historique associées à cet enfant
            // car la contrainte de clé étrangère n'a plus l'option ON DELETE CASCADE
            await db.query('DELETE FROM ChildHistory WHERE child_id = ?', [childId]);
            
            // Ensuite, supprimer l'enfant
            await db.query('DELETE FROM Enfants WHERE id = ?', [childId]);
            
            res.json({ message: 'Création annulée avec succès' });
        } 
        else if (actionType === 'UPDATE') {
            // Vérifier si l'enfant existe toujours
            const [childExists] = await db.query('SELECT COUNT(*) as count FROM Enfants WHERE id = ?', [childId]);
            
            if (childExists[0].count === 0) {
                return res.status(404).json({ message: 'Enfant non trouvé, impossible d\'annuler la modification' });
            }
            
            // Si c'était une mise à jour, on restaure les anciennes données
            const keys = Object.keys(oldData);
            const values = Object.values(oldData);
            
            // Construire la requête de mise à jour dynamique
            const setClause = keys.map(key => `${key} = ?`).join(', ');
            const query = `UPDATE Enfants SET ${setClause} WHERE id = ?`;
            
            // Exécuter la mise à jour
            await db.query(query, [...values, childId]);
            
            // Récupérer les données actuelles pour l'historique
            const [currentData] = await db.query('SELECT * FROM Enfants WHERE id = ?', [childId]);
            
            // Enregistrer cette action de restauration dans l'historique
            await db.query(
                'INSERT INTO ChildHistory (child_id, action_type, user_id, old_data, new_data) VALUES (?, ?, ?, ?, ?)',
                [
                    childId, 
                    'UPDATE', 
                    req.user?.id || null, 
                    JSON.stringify(currentData[0]), 
                    JSON.stringify(oldData)
                ]
            );
            
            res.json({ message: 'Modification annulée avec succès' });
        } 
        else if (actionType === 'DELETE') {
            // Si c'était une suppression, on recrée l'enfant
            const keys = Object.keys(oldData);
            const placeholders = keys.map(() => '?').join(', ');
            const values = Object.values(oldData);
            
            // Construire la requête d'insertion dynamique
            const query = `INSERT INTO Enfants (${keys.join(', ')}) VALUES (${placeholders})`;
            
            // Exécuter l'insertion
            const [result] = await db.query(query, values);
            const newChildId = result.insertId;
            
            // Enregistrer cette action de recréation dans l'historique
            // Utiliser le nouvel ID d'enfant pour respecter la contrainte de clé étrangère
            await db.query(
                'INSERT INTO ChildHistory (child_id, action_type, user_id, old_data, new_data) VALUES (?, ?, ?, ?, ?)',
                [
                    newChildId, 
                    'CREATE', 
                    req.user?.id || null, 
                    null, 
                    JSON.stringify(oldData)
                ]
            );
            
            res.json({ 
                message: 'Suppression annulée avec succès',
                newChildId: newChildId
            });
        }
    } catch (err) {
        console.error('Error reverting change:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err.message });
    }
};
