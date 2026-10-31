const express = require('express');
const { createContact } = require('../controllers/contact.controller');
const { contactValidator } = require('../validators/contact.validator');

const router = express.Router();

router.post('/', contactValidator, createContact);

module.exports = router;
