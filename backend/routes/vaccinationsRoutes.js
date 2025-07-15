const express = require('express');
const router = express.Router();
const vaccinationController = require('../controllers/vaccinationsController');

router.post('/vaccinations', vaccinationController.createVaccination);
router.get('/vaccinations/child', vaccinationController.getVaccinationsByChildId); // Nouvel endpoint pour les vaccinations d'un enfant
router.get('/vaccinations/overdue', vaccinationController.getOverdueVaccinesByChildId); // Endpoint pour les vaccins en retard
router.get('/vaccinations/upcoming', vaccinationController.getUpcomingVaccinesByChildId); // Endpoint pour les vaccins à suivre
router.get('/vaccinations/check-prerequisites', vaccinationController.checkVaccinePrerequisites); // Endpoint pour vérifier les prérequis d'un vaccin
router.get('/vaccinations/check-rappel', vaccinationController.checkRappelAdministered); // Endpoint pour vérifier si un rappel a été administré
router.get('/vaccinations/check-rappel-status', vaccinationController.checkRappelStatus); // Endpoint pour vérifier si un vaccin est un rappel
router.get('/vaccinations/check-all-rappels-administered', vaccinationController.checkAllRappelsAdministered); // Endpoint pour vérifier si tous les rappels d'un vaccin ont été administrés
router.get('/vaccinations/count', vaccinationController.countVaccinationsByChildAndVaccine); // Route pour compter les vaccinations d'un enfant pour un vaccin spécifique
router.post('/vaccinations/mark-rappel-administered', vaccinationController.markRappelAdministered); // Endpoint pour marquer un rappel comme administré
router.get('/vaccinations', vaccinationController.getAllVaccinations);
router.get('/vaccinations/:id', vaccinationController.getVaccinationById);
router.put('/vaccinations/:id', vaccinationController.updateVaccination);
router.delete('/vaccinations/:id', vaccinationController.deleteVaccination);

// Route pour obtenir le nombre d'enfants vaccinés par un vaccin spécifique
router.get('/vaccins/:id/count-enfants', vaccinationController.getCountChildrenByVaccine);

// Route pour obtenir tous les enfants avec des vaccins en retard
router.get('/children-with-overdue-vaccines', vaccinationController.getAllChildrenWithOverdueVaccines);

module.exports = router;