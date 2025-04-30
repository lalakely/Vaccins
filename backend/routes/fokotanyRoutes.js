const express = require('express');
const router = express.Router();
const fokotanyController = require('../controllers/fokotanyController');

router.post('/fokotany', fokotanyController.createFokotany);
router.get('/fokotany', fokotanyController.getAllFokotany);
router.get('/fokotany/:id', fokotanyController.getFokotanyById);
router.put('/fokotany/:id' , fokotanyController.updateFokotany);
router.delete('/fokotany/:id' , fokotanyController.deleteFokotany);

module.exports = router;