
const express = require('express');
const router = express.Router();
const controller = require('./controller'); // Ajusta la ruta según tu estructura de archivos


router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:idUsuarioRecibe', controller.getById);
router.get('/flat/:idUsuarioRecibe', controller.getFlatsWithMessageCountByUser);
router.get('/message/:idUsuarioRecibe/:idUsuarioEnvia/:idflat', controller.getMessagesByParams);

module.exports = router;
