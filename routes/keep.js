const express = require('express');
const { getkeep } = require('../controllers/keepController');
const router = express.Router();

router.get('/work', getkeep);

module.exports = router;
