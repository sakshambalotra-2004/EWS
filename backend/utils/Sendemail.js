const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email notification.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Smart EWS" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent: ${info.messageId}`);
  return info;
};

const buildInterventionEmail = (studentName, interventionType, description) => `
  <div style="font-family:Arial,sans-serif;padding:20px">
    <h2 style="color:#d32f2f">⚠️ Smart EWS Intervention Notice</h2>
    <p>Dear <strong>${studentName}</strong>,</p>
    <p>An intervention of type <strong>${interventionType.toUpperCase()}</strong> has been scheduled for you.</p>
    <p>${description}</p>
    <p>Please log in to the Smart EWS portal for more details.</p>
    <hr/>
    <small>This is an automated message from Smart EWS.</small>
  </div>
`;

module.exports = { sendEmail, buildInterventionEmail };