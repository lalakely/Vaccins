const express = require('express');
const router = express.Router();
const hameauController = require('../controllers/hameauController');

router.post('/hameau', hameauController.createHameau);
router.get('/hameau' , hameauController.getAllHameau);
router.get('/hameau/:id' , hameauController.getHameauById);
router.put('/hameau/:id' , hameauController.updateHameau);
router.delete('/hameau/:id' , hameauController.deleteHameau);
router.get('/hameau/:id/count-enfants', hameauController.countEnfantsInHameau);
router.get('/hameau/:id/vaccination-stats', hameauController.countVaccinatedEnfantsInHameau);
router.get('/hameau/:id/stats', hameauController.getHameauStats);
router.get('/hameau/:id/vaccinations', hameauController.getHameauVaccinations);

module.exports = router;