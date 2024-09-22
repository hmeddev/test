const Joi = require('joi');
const { createErrorResponse, createSuccessResponse,main } = require('../Handler');
const validateSignup = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(5).max(30).required(),
    nickname: Joi.string().alphanum().min(5).max(30).required(),
    password: Joi.string().min(8).max(30).required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(createErrorResponse(error.details[0].message,14));
  
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(5).max(30).required(),
    password: Joi.string().min(8).max(30).required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  
  next();
};

module.exports = { validateSignup, validateLogin };
