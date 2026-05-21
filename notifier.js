const twilio = require('twilio');
const axios = require('axios');

async function triggerCall(subject) {
  if (!process.env.TWILIO_ACCOUNT_SID) return;

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    await client.calls.create({
      twiml: `<Response><Say>Priority email received: ${subject}</Say></Response>`,
      to: process.env.MY_PHONE_NUMBER,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    console.log('Call triggered successfully');
  } catch (err) {
    console.error('Error triggering call:', err.message);
  }
}

async function triggerVibration(subject) {
  if (!process.env.PUSHOVER_USER_KEY) return;

  try {
    await axios.post('https://api.pushover.net/1/messages.json', {
      token: process.env.PUSHOVER_API_TOKEN,
      user: process.env.PUSHOVER_USER_KEY,
      message: `Priority Email: ${subject}`,
      priority: 1, // High priority (vibrates even if silent, depending on settings)
      sound: 'persistent' // Loud sound/vibration
    });
    console.log('Pushover notification sent');
  } catch (err) {
    console.error('Error sending Pushover notification:', err.message);
  }
}

module.exports = { triggerCall, triggerVibration };
