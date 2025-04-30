const express = require('express');
const router = express.Router();
const vaccinationController = require('../controllers/vaccinationController');

router.post('/vaccinations', vaccinationController.createVaccination);
router.get('/vaccinations', vaccinationController.getAllVaccinations);
router.get('/vaccinations/:id', vaccinationController.getVaccinationById);
router.put('/vaccinations/:id', vaccinationController.updateVaccination);
router.delete('/vaccinations/:id', vaccinationController.deleteVaccination);

module.exports = router;