const express = require('express');
const { getgames } = require('../controllers/games');
const { getitems } = require('../controllers/items');
const { getShop } = require('../controllers/Shop');
const { authenticate } = require('../middlewares/authenticate');
const router = express.Router();

router.get('/games', authenticate, getgames);
router.get('/items', authenticate, getitems);
router.get('/shop', authenticate, getShop);
module.exports = router;
