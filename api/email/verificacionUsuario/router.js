const express = require('express');
const router = express.Router();
const emailController = require('./controller');
router.post('/', emailController.sendEmail);
router.get('/:email/:codigo', emailController.verifyEmail);
//router.get('/reenviar/:email', emailController.resendEmail);
module.exports = router;  // Exportar el enrutador correctamente
