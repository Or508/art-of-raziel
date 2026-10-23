const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyAdmin } = require('../middleware/auth');

// Public route - anyone can create a contact request
router.post('/', contactController.createContactRequest);

// Public route - fetch booked time slots for a given date
router.get('/booked-slots', contactController.getBookedSlots);

// Admin routes - require authentication
router.get('/', verifyAdmin, contactController.getContactRequests);
router.put('/:id/status', verifyAdmin, contactController.updateContactRequestStatus);

module.exports = router;
