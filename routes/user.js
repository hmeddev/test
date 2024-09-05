const express = require('express');
const { updateUser, getUser } = require('../controllers/userController');
const { authenticate } = require('../middlewares/authenticate');
const router = express.Router();

router.put('/update', authenticate, updateUser);
router.get('/user', authenticate, getUser);

module.exports = router;
