const express = require('express');
const controller = require('./controller');

const router = express.Router();
console.log('router');
router.post('/signup', controller.create);
router.get('/:id', controller.findById);
router.put('/:id', controller.updateUser);
module.exports = router;