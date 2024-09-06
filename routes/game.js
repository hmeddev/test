const express = require('express');
const { updateUser, getUser } = require('../controllers/games');
const { authenticate } = require('../middlewares/authenticate');
const router = express.Router();

router.put('/games', authenticate, updateUser);

module.exports = router;
