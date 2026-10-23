const nodemailer = require('nodemailer');

const {
  EMAIL_USER,
  EMAIL_PASS,
  ADMIN_EMAIL,
} = process.env;

// Create reusable transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Simple wrapper to send emails
async function sendEmail({ to, subject, html, text }) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('sendEmail: EMAIL_USER or EMAIL_PASS not configured, skipping email.');
    return;
  }

  const mailOptions = {
    from: EMAIL_USER,
    to: to || ADMIN_EMAIL,
    subject,
    text: text || '',
    html: html || undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.warn('sendEmail error:', err.message);
  }
}

module.exports = {
  sendEmail,
};

