const express = require('express');
const router = express.Router();
const emailController = require('./controller');
router.post('/', emailController.sendEmail);
router.get('/:email/:codigo', emailController.verifyEmail);
module.exports = router;  // Exportar el enrutador correctamente
