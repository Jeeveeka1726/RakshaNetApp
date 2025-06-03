require('dotenv').config(); // Load .env variables

const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

// 🔐 Load secrets from .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const recipientNumber = process.env.RECIPIENT_PHONE_NUMBER;
const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

const client = twilio(accountSid, authToken);

app.use(cors());
app.use(express.json());

// 🔹 Route to send SMS
app.post('/send-sms', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Missing "message" in request body.' });
  }

  try {
    const sms = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: recipientNumber,
    });

    res.status(200).json({
      success: true,
      message: `SMS sent successfully to ${recipientNumber}`,
      smsSid: sms.sid,
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔹 Route to make a call
app.post('/make-call', async (req, res) => {
  const { to, message } = req.body;

  if (!message || !to) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing "message" or "to" in request body' 
    });
  }

  try {
    // Extract coordinates from Google Maps URL
    const coordMatch = message.match(/https:\/\/maps\.google\.com\/\?q=([-\d.]+),([-\d.]+)/);
    let finalMessage = message;

    if (coordMatch) {
      const [_, lat, lng] = coordMatch;
      const geoResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`
      );
      const geoData = await geoResponse.json();

      const address = geoData.results[0]?.formatted_address || 
                     `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;

      finalMessage = message.replace(/https:\/\/maps\.google\.com[^\s]+/, address);
    }

    const cleanMessage = finalMessage
      .replace(/[&<>]/g, ' ')
      .replace(/\n/g, '. ')
      .replace(/🚨/g, 'SOS Alert: ')
      .trim();

    const twiml = `
      <Response>
        <Say voice="alice" language="en-IN">
          ${cleanMessage}
        </Say>
      </Response>
    `;

    const call = await client.calls.create({
      url: `http://twimlets.com/echo?Twiml=${encodeURIComponent(twiml)}`,
      to: to,
      from: twilioNumber,
    });

    res.status(200).json({
      success: true,
      message: `Call initiated successfully to ${to}`,
      callSid: call.sid,
    });

  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stack 
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
