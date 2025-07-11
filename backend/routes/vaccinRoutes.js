const express = require('express');
const router = express.Router();
const vaccinController = require('../controllers/vaccinsController');

// Routes principales pour les vaccins
router.post('/vaccins' , vaccinController.createVaccin);
router.get('/vaccins' , vaccinController.getAllVaccins);
router.get('/vaccins/:id' , vaccinController.getVaccinById);
router.put('/vaccins/:id' , vaccinController.updateVaccin);
router.delete('/vaccins/:id' , vaccinController.deleteVaccin);

// Routes spécifiques pour les vaccins prérequis
router.get('/vaccins/:id/prerequis', vaccinController.getVaccinPrerequisites);
router.get('/vaccins/:id/required-by', vaccinController.getVaccinsRequiringThis);

// Routes spécifiques pour les suites de vaccins
router.get('/vaccins/:id/suites', vaccinController.getVaccinSuites);         // Vaccins qui suivent ce vaccin
router.get('/vaccins/:id/pre-suites', vaccinController.getVaccinPreSuites);  // Vaccins pour lesquels ce vaccin est une suite

// Route pour les rappels d'un vaccin
router.get('/vaccins/:id/rappels', vaccinController.getVaccinRappels);       // Rappels du vaccin

module.exports= router;