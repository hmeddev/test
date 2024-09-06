const express = require('express');
const { getgames } = require('../controllers/games');
const { authenticate } = require('../middlewares/authenticate');
const router = express.Router();

router.get('/games', authenticate, getgames);

module.exports = router;
