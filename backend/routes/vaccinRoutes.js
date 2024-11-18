const express = require('express');
const router = express.Router();
const vaccinController = require('../controllers/vaccinsController');

router.post('/vaccins' , vaccinController.createVaccin);
router.get('/vaccins' , vaccinController.getAllVaccins);
router.get('/vaccins/:id' , vaccinController.getVaccinById);
router.put('/vaccins/:id' , vaccinController.updateVaccin);
router.delete('/vaccins/:id' , vaccinController.deleteVaccin);

module.exports= router;