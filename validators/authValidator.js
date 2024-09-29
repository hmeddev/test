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
      'string.base': 'Username must be a string.',
      'string.empty': 'Username cannot be empty.',
      'string.min': 'Username must be at least 5 characters long.',
      'string.max': 'Username cannot exceed 30 characters.',
      'any.required': 'Username is required.'
    }),
  key: Joi.string()
    .alphanum()
    .min(5)
    .max(30)
    .required()
    .messages({
      'string.base': 'API key must be a string.',
      'string.empty': 'API key cannot be empty.',
      'string.min': 'API key must be at least 5 characters long.',
      'string.max': 'API key cannot exceed 30 characters.',
      'any.required': 'API key is required.'
    }),
  password: Joi.string()
    .min(8)
    .max(30)
    .required()
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_+\-={}\[\]:;"'<>?,.\/\\|`~]+$/)
    .messages({
      'string.base': 'Password must be a string.',
      'string.empty': 'Password cannot be empty.',
      'string.min': 'Password must be at least 8 characters long.',
      'string.max': 'Password cannot exceed 30 characters.',
      'any.required': 'Password is required.',
      'string.pattern.base': 'Password contains invalid characters.'
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
      'string.base': 'Nickname must be a string.',
      'string.empty': 'Nickname cannot be empty.',
      'string.min': 'Nickname must be at least 5 characters long.',
      'string.max': 'Nickname cannot exceed 30 characters.',
      'any.required': 'Nickname is required.'
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
    console.log(errorDetails)
    return res.status(400).json(createErrorResponse(ERROR_CODES.missing_ERROR, errorDetails));
  }

  const isValidApiKey = await validateApiKey(req.body.key);
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
