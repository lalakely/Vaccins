const express = require('express');
const router = express.Router();
const fokotanyController = require('../controllers/fokotanyController');

router.post('/fokotany', fokotanyController.createFokotany);
router.get('/fokotany', fokotanyController.getAllFokotany);
router.get('/fokotany/:id', fokotanyController.getFokotanyById);
router.get('/fokotany/:id' , fokotanyController.updateFokotany);
router.get('/fokotany/:id' , fokotanyController.deleteFokotany);

module.exports = router;