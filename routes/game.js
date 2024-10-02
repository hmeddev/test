const express = require('express');
const { getgames } = require('../controllers/games');
const { getitems } = require('../controllers/items');
const { authenticate } = require('../middlewares/authenticate');
const router = express.Router();

router.get('/games', authenticate, getgames);
router.get('/items', authenticate, getitems);
module.exports = router;
