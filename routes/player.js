const express = require('express');
const { getInventory } = require('../controllers/Inventory');

const { authenticate } = require('../middlewares/authenticate');
const router = express.Router();

router.get('/inventory', authenticate, getInventory);

module.exports = router;
