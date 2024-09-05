const express = require('express');
const { signup, login, refreshToken, logout } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../validators/authValidator');
const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/token', refreshToken);
router.post('/logout', logout);

module.exports = router;
