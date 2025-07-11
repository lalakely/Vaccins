const express = require('express');
const router = express.Router();
const enfantController = require('../controllers/enfantsController');

router.post('/enfants', enfantController.createEnfant); // Add a child in the list
router.get('/enfants', enfantController.getAllEnfants); // Get all the child in the list
router.get('/enfants/vaccine/:vaccinId', enfantController.getEnfantsByVaccin); // Get children by vaccine
router.get('/enfants/not-vaccinated/:vaccinId', enfantController.getEnfantsNotVaccinated); // Get children NOT vaccinated
router.get('/enfants/vaccine/:vaccinId/rappel/:rappelCount', enfantController.getEnfantsByVaccinWithRappels); // Get children with specific rappel count
router.get('/enfants/:id', enfantController.getEnfantById);  // Get the child by th id
router.put('/enfants/:id', enfantController.updateEnfant);   // Update the list of the child
router.delete('/enfants/:id', enfantController.deleteEnfant);   // Delete e child in the list

module.exports = router;