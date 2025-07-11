/**
 * Script pour corriger les données JSON dans la table ChildHistory
 * Ce script convertit les objets JavaScript en chaînes JSON valides
 */

const db = require('../config/db');

async function fixChildHistoryData() {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Récupérer toutes les entrées de ChildHistory
    const [rows] = await connection.query('SELECT id, old_data, new_data FROM ChildHistory');
    console.log(`Nombre total d'entrées à traiter: ${rows.length}`);
    
    // 2. Parcourir chaque entrée et corriger les données JSON
    for (const row of rows) {
      const { id, old_data, new_data } = row;
      console.log(`Traitement de l'entrée ID: ${id}`);
      
      // Convertir old_data en chaîne JSON si c'est un objet
      let oldDataFixed = old_data;
      if (old_data !== null && typeof old_data === 'object') {
        oldDataFixed = JSON.stringify(old_data);
        console.log(`  old_data converti en chaîne JSON`);
      }
      
      // Convertir new_data en chaîne JSON si c'est un objet
      let newDataFixed = new_data;
      if (new_data !== null && typeof new_data === 'object') {
        newDataFixed = JSON.stringify(new_data);
        console.log(`  new_data converti en chaîne JSON`);
      }
      
      // Mettre à jour l'entrée dans la base de données
      await connection.query(
        'UPDATE ChildHistory SET old_data = ?, new_data = ? WHERE id = ?',
        [oldDataFixed, newDataFixed, id]
      );
      
      console.log(`  Entrée ID: ${id} mise à jour avec succès`);
    }
    
    await connection.commit();
    console.log('Toutes les entrées ont été corrigées avec succès');
    
  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors de la correction des données:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

// Exécuter le script
fixChildHistoryData();
