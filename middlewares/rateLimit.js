// rateLimiter.js

const rateLimit = require('express-rate-limit');
const { createErrorResponse } = require('../lib/Handler');
const ERROR_CODES = require('../lib/errorCodes');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2,
  handler: (req, res) => {
    res.status(429).json(createErrorResponse(ERROR_CODES.TOO_MANY_LOGIN_ATTEMPTS, ERROR_CODES.TOO_MANY_LOGIN_ATTEMPTS.message));
  },
  standardHeaders: true, // لإرسال معلومات الحد في رؤوس الاستجابة
  legacyHeaders: false,
});

module.exports = { loginLimiter };
