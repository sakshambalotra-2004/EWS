const twilio = require('twilio');

/**
 * Send an SMS notification via Twilio.
 * Client is initialized lazily so missing credentials don't crash the server.
 * @param {string} to - Recipient phone number (E.164 format)
 * @param {string} message - SMS body
 */
const sendSMS = async (to, message) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token || !sid.startsWith('AC')) {
    console.warn('Twilio credentials not configured. SMS skipped.');
    return null;
  }

  const client = twilio(sid, token);
  const result = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to,
  });
  console.log(`SMS sent: ${result.sid}`);
  return result;
};

const buildInterventionSMS = (studentName, interventionType) =>
  `Smart EWS Alert: Dear ${studentName}, a ${interventionType} intervention has been scheduled. Please check the EWS portal.`;

module.exports = { sendSMS, buildInterventionSMS };