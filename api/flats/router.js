
const express = require('express');
const router = express.Router();
const controller = require('./controller'); // Ajusta la ruta según tu estructura de archivos


console.log('routerflats');
router.post('/', controller.create);
router.get('/:id', controller.findFullFlatById);
router.get('/', controller.findAllFlats);
router.put('/:id', controller.updateFlat);
router.get('/user/:userId', controller.findFlatsByUser);
router.get('/counters/user', controller.countFlats);

module.exports = router;
