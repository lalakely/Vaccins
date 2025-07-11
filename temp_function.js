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
