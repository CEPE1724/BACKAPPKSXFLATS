
const express = require('express');
const router = express.Router();
const controller = require('./controller'); // Ajusta la ruta según tu estructura de archivos

router.get('/', controller.getAll);


module.exports = router;
