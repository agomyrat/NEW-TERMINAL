const express = require('express');
const router = express.Router();
const itemController = require('../controllers/terminalController');

router.get('/', itemController.allTerminals);

module.exports = router;
