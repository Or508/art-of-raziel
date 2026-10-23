// server/controllers/contactController.js
const db = require('../config/db');
const { sendEmail } = require('../utils/sendEmail');
const { appendContactToSheet } = require('../utils/googleSheets');

// Create a new contact request
exports.createContactRequest = async (req, res) => {
  try {
    const { fullName, email, phone, meetingType, channel, notes, meeting_date, meeting_time } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Full name and email are required'
      });
    }

    if (!meeting_date || !meeting_time) {
      return res.status(400).json({
        success: false,
        message: 'meeting_date and meeting_time are required'
      });
    }

    // Prevent double-booking for the same date+time (source of truth is the DB)
    const [alreadyBooked] = await db.execute(
      `SELECT id FROM contact_requests WHERE meeting_date = ? AND meeting_time = ? LIMIT 1`,
      [meeting_date, meeting_time]
    );

    if (alreadyBooked && alreadyBooked.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Selected time slot is already booked'
      });
    }

    // 1) Persist to DB – this is the primary goal
    const insertQuery = `
      INSERT INTO contact_requests 
      (full_name, email, phone, meeting_type, channel, notes, meeting_date, meeting_time, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    const [result] = await db.execute(insertQuery, [
      fullName,
      email,
      phone || null,
      meetingType || 'zoom',
      channel || null,
      notes || null,
      meeting_date || null,
      meeting_time || null
    ]);

    const createdRequest = {
      id: result.insertId,
      fullName,
      email,
      phone,
      meetingType,
      channel: channel || null,
      notes,
      meeting_date: meeting_date || null,
      meeting_time: meeting_time || null,
      status: 'pending'
    };

    // 2) Fire-and-forget integrations (email / WhatsApp / Google Sheets)
    // Any failure here should NOT break the response to the client.
    // We keep each integration isolated so one failing integration doesn't prevent the other.
    try {
      const adminEmailSubject = 'New contact request - Art of Raziel';
      const adminEmailHtml = `
        <h2>New Contact Request</h2>
        <p><strong>Full Name:</strong> ${createdRequest.fullName}</p>
        <p><strong>Email:</strong> ${createdRequest.email}</p>
        <p><strong>Phone:</strong> ${createdRequest.phone || '-'}</p>
        <p><strong>Meeting Type:</strong> ${createdRequest.meetingType}</p>
        <p><strong>Channel:</strong> ${createdRequest.channel || '-'}</p>
        <p><strong>Meeting Date:</strong> ${createdRequest.meeting_date || '-'}</p>
        <p><strong>Meeting Time:</strong> ${createdRequest.meeting_time || '-'}</p>
        <p><strong>Notes:</strong><br/>${createdRequest.notes || '-'}</p>
      `;

      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: adminEmailSubject,
          html: adminEmailHtml,
        });
      } catch (emailError) {
        console.warn('CONTACT FORM EMAIL INTEGRATION WARNING:', emailError);
      }

      try {
        // Append to Google Sheet (secondary log)
        await appendContactToSheet(createdRequest);
      } catch (sheetsError) {
        console.warn('CONTACT FORM SHEETS INTEGRATION WARNING:', sheetsError);
      }
    } catch (integrationError) {
      // This should be rare since each integration is isolated,
      // but keep it defensive.
      console.warn('CONTACT FORM INTEGRATION WARNING:', integrationError);
    }

    return res.status(201).json({
      success: true,
      message: 'Contact request created successfully',
      data: createdRequest
    });
  } catch (error) {
    console.error('CONTACT FORM ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create contact request'
    });
  }
};

// Get all contact requests
exports.getContactRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM contact_requests ORDER BY created_at DESC';
    let params = [];

    if (status && ['pending', 'in_progress', 'resolved'].includes(status)) {
      query = 'SELECT * FROM contact_requests WHERE status = ? ORDER BY created_at DESC';
      params = [status];
    }

    const [requests] = await db.execute(query, params);

    return res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact requests'
    });
  }
};

// Update contact request status
exports.updateContactRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, in_progress, or resolved'
      });
    }

    const query = 'UPDATE contact_requests SET status = ? WHERE id = ?';
    const [result] = await db.execute(query, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contact request status updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update contact request'
    });
  }
};

// GET /api/contact/booked-slots?date=YYYY-MM-DD
exports.getBookedSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'date query parameter is required (YYYY-MM-DD)'
      });
    }

    // Basic validation to prevent accidental malformed input
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'date must be in format YYYY-MM-DD'
      });
    }

    const query = `
      SELECT DISTINCT meeting_time
      FROM contact_requests
      WHERE meeting_date = ?
        AND meeting_time IS NOT NULL
        AND meeting_time <> ''
    `;

    const [rows] = await db.execute(query, [date]);
    const slots = (rows || [])
      .map((r) => r.meeting_time)
      .filter((t) => typeof t === 'string' && t.length > 0);

    return res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booked slots'
    });
  }
};
