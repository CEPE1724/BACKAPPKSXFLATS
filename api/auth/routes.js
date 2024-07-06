// router.js

const express = require('express');
const controller = require('./controller'); // Ajusta la ruta según tu estructura de archivos

const router = express.Router();

router.get('/validateExistEmail/:email', controller.validateExistEmail);
router.post('/signin', controller.signin);

module.exports = router;
