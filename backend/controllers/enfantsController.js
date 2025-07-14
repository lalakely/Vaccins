const db = require('../config/db'); // Pool MySQL compatible avec les promesses
const { promisify } = require('util');
const notificationsController = require('./notificationsController');

// Add a new child
exports.createEnfant = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const sql = `
            INSERT INTO Enfants (
                Nom, Prenom, CODE, date_naissance, age_premier_contact,
                SEXE, NomMere, NomPere, Domicile, Fokotany, Hameau, Telephone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            req.body.Nom,
            req.body.Prenom,
            req.body.CODE,
            req.body.date_naissance,
            req.body.age_premier_contact,
            req.body.SEXE,
            req.body.NomMere,
            req.body.NomPere,
            req.body.Domicile,
            req.body.Fokotany,
            req.body.Hameau,
            req.body.Telephone,
        ];

        console.log('SQL:', sql);
        console.log('Values:', values);

        const [result] = await connection.query(sql, values);
        const childId = result.insertId;
        
        // Enregistrer dans l'historique
        const newData = {
            ...req.body,
            id: childId
        };
        
        await connection.query(
            'INSERT INTO ChildHistory (child_id, action_type, user_id, old_data, new_data) VALUES (?, ?, ?, ?, ?)',
            [childId, 'CREATE', req.user?.id || null, null, JSON.stringify(newData)]
        );
        
        await connection.commit();
        
        res.status(201).json({
            message: "Enfant ajouté avec succès",
            id: childId,
        });
    } catch (err) {
        await connection.rollback();
        console.error('Error details:', err);
        res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    } finally {
        connection.release();
    }
};

// Get all children
exports.getAllEnfants = async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM Enfants");
        res.json(results);
    } catch (err) {
        console.error('Error fetching children:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Get a child by its ID
exports.getEnfantById = async (req, res) => {
    const enfantId = req.params.id;

    try {
        const [result] = await db.query("SELECT * FROM Enfants WHERE id = ?", [enfantId]);
        if (result.length === 0) {
            return res.status(404).json({ message: "Enfant non trouvé" });
        }
        res.json(result[0]); // Retourne le premier enfant trouvé
    } catch (err) {
        console.error('Error fetching child by ID:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Update the information about a child
exports.updateEnfant = async (req, res) => {
    const enfantId = req.params.id;
    const {
        Nom,
        Prenom,
        CODE,
        date_naissance,
        age_premier_contact,
        SEXE,
        NomMere,
        NomPere,
        Domicile,
        Fokotany,
        Hameau,
        Telephone,
    } = req.body;

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Récupérer les données actuelles avant la mise à jour
        const [currentData] = await connection.query("SELECT * FROM Enfants WHERE id = ?", [enfantId]);
        
        if (currentData.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Enfant non trouvé" });
        }
        
        const oldData = currentData[0];
        
        const query = `
            UPDATE Enfants 
            SET Nom = ?, Prenom = ?, CODE = ?, date_naissance = ?, age_premier_contact = ?, 
            SEXE = ?, NomMere = ?, NomPere = ?, Domicile = ?, Fokotany = ?, Hameau = ?, Telephone = ? 
            WHERE id = ?
        `;

        console.log('Updating child with ID:', enfantId);

        const updateValues = [
            Nom,
            Prenom,
            CODE,
            date_naissance,
            age_premier_contact,
            SEXE,
            NomMere,
            NomPere,
            Domicile,
            Fokotany,
            Hameau,
            Telephone,
            enfantId,
        ];

        const [result] = await connection.query(query, updateValues);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Enfant non trouvé" });
        }
        
        // Enregistrer dans l'historique
        const newData = {
            ...req.body,
            id: enfantId
        };
        
        await connection.query(
            'INSERT INTO ChildHistory (child_id, action_type, user_id, old_data, new_data) VALUES (?, ?, ?, ?, ?)',
            [enfantId, 'UPDATE', req.user?.id || null, JSON.stringify(oldData), JSON.stringify(newData)]
        );
        
        await connection.commit();
        
        res.json({ message: "Enfant mis à jour avec succès" });
    } catch (err) {
        await connection.rollback();
        console.error('Error updating child:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    } finally {
        connection.release();
    }
};

// Delete a child from the list
// Get all children by vaccine ID
exports.getEnfantsByVaccin = async (req, res) => {
  const vaccinId = req.params.vaccinId;

  try {
    const query = `
      SELECT DISTINCT e.* 
      FROM Enfants e
      JOIN Vaccinations v ON e.id = v.enfant_id
      WHERE v.vaccin_id = ?
    `;
    
    const [results] = await db.query(query, [vaccinId]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching children by vaccine:', err);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// Get all children NOT vaccinated with a specific vaccine
exports.getEnfantsNotVaccinated = async (req, res) => {
  const vaccinId = req.params.vaccinId;

  try {
    const query = `
      SELECT * 
      FROM Enfants e
      WHERE e.id NOT IN (
        SELECT DISTINCT enfant_id 
        FROM Vaccinations 
        WHERE vaccin_id = ?
      )
    `;
    
    const [results] = await db.query(query, [vaccinId]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching children not vaccinated:', err);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// Get children by vaccine with a specific number of reminders
exports.getEnfantsByVaccinWithRappels = async (req, res) => {
  const vaccinId = req.params.vaccinId;
  const rappelCount = parseInt(req.params.rappelCount, 10);

  try {
    // Récupérer les enfants qui ont exactement le nombre de rappels spécifié
    const query = `
      SELECT e.* 
      FROM Enfants e
      JOIN (
        SELECT enfant_id, COUNT(*) as count_vaccinations
        FROM Vaccinations
        WHERE vaccin_id = ?
        GROUP BY enfant_id
        HAVING count_vaccinations = ?
      ) as v ON e.id = v.enfant_id
    `;
    
    const [results] = await db.query(query, [vaccinId, rappelCount]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching children by vaccine and rappel count:', err);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

exports.deleteEnfant = async (req, res) => {
    const enfantId = req.params.id;
    const connection = await db.getConnection();
  
    try {
      await connection.beginTransaction();
      
      console.log("Tentative de suppression de l'enfant avec ID :", enfantId);
      
      // Récupérer les données de l'enfant avant suppression
      const [childData] = await connection.query("SELECT * FROM Enfants WHERE id = ?", [enfantId]);
      
      if (childData.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Enfant non trouvé" });
      }
      
      // S'assurer que oldData est un objet JavaScript valide
      const oldData = childData[0];
      
      // Ordre correct des opérations pour éviter les erreurs de contrainte de clé étrangère
      
      // Préparer les données pour l'historique de suppression
      const oldDataJson = JSON.stringify(oldData);
      const childInfo = {
        id: oldData.id,
        Nom: oldData.Nom,
        Prenom: oldData.Prenom
      };
      
      // 1. D'abord, supprimer les vaccinations associées
      console.log(`Suppression des vaccinations pour l'enfant ID: ${enfantId}`);
      await connection.query("DELETE FROM Vaccinations WHERE enfant_id = ?", [enfantId]);
      
      // 2. Ensuite, supprimer TOUTES les entrées d'historique existantes pour cet enfant
      console.log(`Suppression des entrées d'historique pour l'enfant ID: ${enfantId}`);
      await connection.query("DELETE FROM ChildHistory WHERE child_id = ?", [enfantId]);
      
      // 3. Supprimer l'enfant lui-même
      console.log(`Suppression de l'enfant ID: ${enfantId}`);
      const [result] = await connection.query("DELETE FROM Enfants WHERE id = ?", [enfantId]);
      
      // Créer une notification pour informer de la suppression
      try {
        await notificationsController.createSystemNotification(
          req.user?.id, // ID de l'utilisateur qui a effectué la suppression
          "Enfant supprimé",
          `L'enfant ${oldData.Prenom} ${oldData.Nom} a été supprimé du système`,
          "warning",
          "action_feedback",
          "/Personnes",
          null,
          null
        );
        
        // Notification pour les statistiques
        await notificationsController.createSystemNotification(
          null, // Notification globale
          "Mise à jour des statistiques",
          `Un enfant a été retiré de la base de données : ${oldData.Prenom} ${oldData.Nom}`,
          "info",
          "statistics",
          "/dashboard"
        );
      } catch (notifError) {
        // Ne pas bloquer le processus si la création de notification échoue
        console.error('Erreur lors de la création des notifications de suppression :', notifError);
        // La suppression a été effectuée, donc on continue
      }
      
      // 4. Vérifier si la table DeletedChildrenLog existe, sinon la créer
      try {
        // Vérifier si la table existe
        const [tableCheck] = await connection.query(
          "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'csb' AND table_name = 'DeletedChildrenLog'"
        );
        
        // Si la table n'existe pas, la créer
        if (tableCheck[0].count === 0) {
          console.log("La table DeletedChildrenLog n'existe pas encore. Création de la table...");
          await connection.query(`
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
        
        // Enregistrer l'action dans la table d'historique des suppressions
        console.log(`Enregistrement de l'historique de suppression pour l'enfant ID: ${enfantId}`);
        await connection.query(
          'INSERT INTO DeletedChildrenLog (original_id, action_date, user_id, child_data) VALUES (?, NOW(), ?, ?)',
          [enfantId, req.user?.id || null, oldDataJson]
        );
      } catch (err) {
        console.error("Erreur lors de la vérification ou création de la table DeletedChildrenLog:", err);
        // Continuer sans enregistrer l'historique de suppression
      }
  
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Enfant non trouvé" });
      }
      
      await connection.commit();
  
      res.json({ message: "Enfant supprimé avec succès" });
    } catch (err) {
      await connection.rollback();
      console.error("Erreur détaillée lors de la suppression :", err);
      res.status(500).json({ message: "Erreur interne du serveur", error: err.message });
    } finally {
      connection.release();
    }
  };