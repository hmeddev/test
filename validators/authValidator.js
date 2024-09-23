const Joi = require('joi');
const admin = require('../firebase');
const db = admin.database();


async function testapikey(key) {
  try {
    const ref = db.ref("BOTONE/APIKEY/"+key);
    const snapshot = await ref.once('value');
    return snapshot.val() || false;
  } catch (error) {
    console.error(`error : `, error.message);
    return false
  }
}
const { createErrorResponse, createSuccessResponse,main } = require('../Handler');
const validateSignup = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(5).max(30).required().pattern(/^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]*$/),
    apikey: Joi.string().alphanum().min(5).max(30).required().pattern(/^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]*$/),
    nickname: Joi.string().alphanum().min(5).max(30).required().pattern(/^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]*$/),
    password: Joi.string().min(8).max(30).required().pattern(/^[a-zA-Z0-9!@#$%^&*()_+\-={}\[\]:;"'<>?,.\/\\|`~]*$/)
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(createErrorResponse(error.details,14));
  if(!testapikey(req.body.apikey))
    {
      createErrorResponse("api key ? ",16)
      return
    }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(5).max(30).required().pattern(/^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]*$/),
    apikey: Joi.string().alphanum().min(5).max(30).required().pattern(/^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]*$/),
    password: Joi.string().min(8).max(30).required().pattern(/^[a-zA-Z0-9!@#$%^&*()_+\-={}\[\]:;"'<>?,.\/\\|`~]*$/)
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(createErrorResponse(error.details,15));
  if(!testapikey(req.body.apikey))
    {
      createErrorResponse("api key ? ",17)
      return
    }
  next();
};




module.exports = { validateSignup, validateLogin };
