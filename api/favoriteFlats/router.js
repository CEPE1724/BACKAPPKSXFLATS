const express = require('express');
const router = express.Router();
const controller = require('./controller'); // Adjust the path based on your file structure

router.post('/', controller.createFavorite);
router.get('/:user/:flat', controller.getFavorites);
router.get('/:user', controller.getAllFavorites);

module.exports = router;