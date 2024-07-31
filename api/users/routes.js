const express = require('express');
const controller = require('./controller');

const router = express.Router();
console.log('router');
router.post('/signup', controller.create);
router.get('/:id', controller.findById);
router.put('/:id', controller.updateUser);
router.get('/', controller.getAll);
router.get('/filter');
router.get('/delete/:id', controller.deleteUser);
router.get('/saveresetpassword/:email', controller.saveResetPassword);
module.exports = router;