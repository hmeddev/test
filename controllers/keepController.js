// itemsController.js

const admin = require('../firebase/firebase');
const { createErrorResponse, createSuccessResponse,main } = require('../lib/Handler');
const ERROR_CODES = require('../lib/errorCodes');
const db = admin.database();
const path = main().path;

const getkeep = (req, res) => {

    res.json(createSuccessResponse({ work: true }, 'yeah, it work'));

}
  
  module.exports = { getkeep };