const Contact = require('../models/Contact.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../utils/validateRequest');

// POST /api/contact
const createContact = asyncHandler(async (req, res) => {
  validateRequest(req);

  const contact = await Contact.create({
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    subject: req.body.subject,
    message: req.body.message,
  });

  res.status(201).json(
    new ApiResponse(201, { contact }, 'Message received. We will get back to you soon.')
  );
});

module.exports = { createContact };
