// middlewares/validation.js

const Joi = require('joi');
const admin = require('../firebase/firebase');
const db = admin.database();
const { createErrorResponse } = require('../lib/Handler');
const ERROR_CODES = require('../lib/errorCodes');

// تعريف Schema بشكل منفصل
const baseSchema = {
  username: Joi.string()
    .alphanum()
    .min(5)
    .max(30)
    .required()
    .messages({
      'string.base': 'Username يجب أن يكون نصًا.',
      'string.empty': 'Username لا يمكن أن يكون فارغًا.',
      'string.min': 'Username يجب أن يحتوي على 5 أحرف على الأقل.',
      'string.max': 'Username يجب ألا يتجاوز 30 حرفًا.',
      'any.required': 'Username مطلوب.'
    }),
  key: Joi.string()
    .alphanum()
    .min(5)
    .max(30)
    .required()
    .messages({
      'string.base': 'API key يجب أن يكون نصًا.',
      'string.empty': 'API key لا يمكن أن يكون فارغًا.',
      'string.min': 'API key يجب أن يحتوي على 5 أحرف على الأقل.',
      'string.max': 'API key يجب ألا يتجاوز 30 حرفًا.',
      'any.required': 'API key مطلوب.'
    }),
  password: Joi.string()
    .min(8)
    .max(30)
    .required()
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_+\-={}\[\]:;"'<>?,.\/\\|`~]+$/)
    .messages({
      'string.base': 'Password يجب أن يكون نصًا.',
      'string.empty': 'Password لا يمكن أن يكون فارغًا.',
      'string.min': 'Password يجب أن يحتوي على 8 أحرف على الأقل.',
      'string.max': 'Password يجب ألا يتجاوز 30 حرفًا.',
      'any.required': 'Password مطلوب.',
      'string.pattern.base': 'Password يحتوي على أحرف غير صالحة.'
    }),
};

const signupSchema = Joi.object({
  ...baseSchema,
  nickname: Joi.string()
    .alphanum()
    .min(5)
    .max(30)
    .required()
    .messages({
      'string.base': 'Nickname يجب أن يكون نصًا.',
      'string.empty': 'Nickname لا يمكن أن يكون فارغًا.',
      'string.min': 'Nickname يجب أن يحتوي على 5 أحرف على الأقل.',
      'string.max': 'Nickname يجب ألا يتجاوز 30 حرفًا.',
      'any.required': 'Nickname مطلوب.'
    }),
});

const loginSchema = Joi.object(baseSchema);

// دالة التحقق من مفتاح API
async function validateApiKey(key) {
  try {
    console.log(key)
    const ref = db.ref(`BOTONE/APIKEY/${key}`);
    const snapshot = await ref.once('value');
    return snapshot.exists();
  } catch (error) {
    console.error('Error validating API key:', error.message);
    return false;
  }
}

// دالة التحقق من الطلب
async function validateRequest(req, res, next, isSignup = true) {
  const { error } = isSignup ? signupSchema.validate(req.body, { abortEarly: false }) : loginSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorDetails = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json(createErrorResponse(ERROR_CODES.VALIDATION_ERROR, errorDetails));
  }

  const isValidApiKey = await validateApiKey(req.body.key);
  console.log(isValidApiKey)
  console.log(req.body.key)
  if (!isValidApiKey) {
    return res.status(400).json(createErrorResponse(ERROR_CODES.INVALID_API_KEY, ERROR_CODES.INVALID_API_KEY.message));
  }

  next();
}

// Middleware للـ Signup
const validateSignup = (req, res, next) => validateRequest(req, res, next, true);

// Middleware للـ Login
const validateLogin = (req, res, next) => validateRequest(req, res, next, false);

module.exports = { validateSignup, validateLogin };
