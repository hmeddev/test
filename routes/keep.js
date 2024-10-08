const express = require('express');
const { getkeep } = require('../controllers/keepController');
const router = express.Router();

router.get('/', getkeep);

module.exports = router;
