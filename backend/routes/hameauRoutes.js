const express = require('express');
const router = express.Router();
const hameauController = require('../controllers/hameauController');

router.post('/hameau', hameauController.createHameau);
router.get('/hameau' , hameauController.getAllEnfants);
router.get('/hameau/:id' , hameauController.getHameauById);
router.put('/hameau/:id' , hameauController.updateHameau);
router.delete('/hameau/:id' , hameauController.deleteHameau);

module.exports = router;