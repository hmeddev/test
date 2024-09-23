const Joi = require('joi');
const admin = require('../firebase');
const db = admin.database();

async function validateApiKey(key) {
  try {
    const ref = db.ref(`BOTONE/APIKEY/${key}`);
    const snapshot = await ref.once('value');
    return snapshot.val() || false;
  } catch (error) {
    console.error('Error validating API key:', error.message);
    return false;
  }
}

const { createErrorResponse, createSuccessResponse, main } = require('../Handler');

const schema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(5)
    .max(30)
    .required()
    .pattern(/^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]*$/),
  apikey: Joi.string()
    .alphanum()
    .min(5)
    .max(30)
    .required()
    .pattern(/^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]*$/),
  nickname: Joi.string()
    .alphanum()
    .min(5)
    .max(30)
    .required()
    .pattern(/^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]*$/),
  password: Joi.string()
    .min(8)
    .max(30)
    .required()
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_+\-={}\[\]:;"'<>?,.\/\\|`~]*$/),
});

async function validateRequest(req, res, next, isSignup = true) {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(createErrorResponse(error.details, isSignup ? 14 : 15));

  const isValidApiKey = await validateApiKey(req.body.apikey);
  if (!isValidApiKey) {
    return res.status(400).json(createErrorResponse('Invalid API key', isSignup ? 16 : 17));
  }

  next();
}

const validateSignup = (req, res, next) => validateRequest(req, res, next, true);
const validateLogin = (req, res, next) => validateRequest(req, res, next, false);

module.exports = { validateSignup, validateLogin };
