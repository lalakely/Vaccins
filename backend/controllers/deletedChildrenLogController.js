const db = require('../config/db');

// Récupérer tous les logs de suppression d'enfants
exports.getAllDeletedChildrenLogs = async (req, res) => {
    try {
        const [results] = await db.query(
            `SELECT dcl.*, u.username 
             FROM DeletedChildrenLog dcl
             LEFT JOIN users u ON dcl.user_id = u.id
             ORDER BY dcl.action_date DESC
             LIMIT 100`
        );
        
        // S'assurer que child_data est une chaîne JSON valide
        const formattedResults = results.map(item => ({
            ...item,
            child_data: item.child_data !== null ? 
                (typeof item.child_data === 'object' ? JSON.stringify(item.child_data) : item.child_data) : 
                null
        }));
        
        res.json(formattedResults);
    } catch (err) {
        console.error('Error fetching deleted children logs:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Récupérer un log de suppression spécifique
exports.getDeletedChildLogById = async (req, res) => {
    const logId = req.params.id;
    
    try {
        const [results] = await db.query(
            `SELECT dcl.*, u.username 
             FROM DeletedChildrenLog dcl
             LEFT JOIN users u ON dcl.user_id = u.id
             WHERE dcl.id = ?`,
            [logId]
        );
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Log de suppression non trouvé' });
        }
        
        // S'assurer que child_data est une chaîne JSON valide
        const formattedResult = {
            ...results[0],
            child_data: results[0].child_data !== null ? 
                (typeof results[0].child_data === 'object' ? JSON.stringify(results[0].child_data) : results[0].child_data) : 
                null
        };
        
        res.json(formattedResult);
    } catch (err) {
        console.error('Error fetching deleted child log:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Restaurer un enfant supprimé
exports.revertDeletion = async (req, res) => {
    const logId = req.params.id;
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Récupérer les données de l'enfant supprimé
        const [logs] = await connection.query(
            'SELECT * FROM DeletedChildrenLog WHERE id = ?',
            [logId]
        );
        
        if (logs.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Log de suppression non trouvé' });
        }
        
        const deletedLog = logs[0];
        let childData;
        
        try {
            // S'assurer que child_data est un objet JSON valide
            if (typeof deletedLog.child_data === 'string') {
                childData = JSON.parse(deletedLog.child_data);
            } else {
                childData = deletedLog.child_data;
            }
        } catch (err) {
            await connection.rollback();
            return res.status(400).json({ message: 'Données d\'enfant invalides dans le log de suppression' });
        }
        
        // 2. Réinsérer l'enfant dans la table Enfants
        const keys = Object.keys(childData);
        const placeholders = keys.map(() => '?').join(', ');
        
        // Format datetime values to MySQL format (YYYY-MM-DD HH:MM:SS)
        const formattedChildData = { ...childData };
        const dateFields = ['created_at', 'updated_at', 'date_naissance'];
        
        for (const field of dateFields) {
            if (formattedChildData[field] && typeof formattedChildData[field] === 'string') {
                try {
                    // Convert ISO date string to MySQL datetime format
                    const date = new Date(formattedChildData[field]);
                    formattedChildData[field] = date.toISOString().slice(0, 19).replace('T', ' ');
                } catch (error) {
                    console.error(`Error formatting date field ${field}:`, error);
                    // Keep original value if parsing fails
                }
            }
        }
        
        const values = Object.values(formattedChildData);
        
        // Construire la requête d'insertion dynamique
        const query = `INSERT INTO Enfants (${keys.join(', ')}) VALUES (${placeholders})`;
        
        // Exécuter l'insertion
        const [result] = await connection.query(query, values);
        const newChildId = result.insertId;
        
        // 3. Enregistrer cette action de restauration dans l'historique
        await connection.query(
            'INSERT INTO ChildHistory (child_id, action_type, user_id, old_data, new_data) VALUES (?, ?, ?, ?, ?)',
            [
                newChildId, 
                'CREATE', 
                req.user?.id || null, 
                null, 
                JSON.stringify(childData)
            ]
        );
        
        // 4. Supprimer l'entrée du log de suppression (optionnel)
        // Nous gardons l'entrée pour conserver l'historique complet
        
        await connection.commit();
        
        res.json({ 
            message: 'Enfant restauré avec succès',
            newChildId: newChildId
        });
    } catch (err) {
        await connection.rollback();
        console.error('Error reverting deletion:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err.message });
    } finally {
        connection.release();
    }
};
