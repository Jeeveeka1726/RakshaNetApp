require("dotenv").config(); // Load .env variables

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const fetch = require("node-fetch");
const axios = require("axios");
const { syncDatabase } = require("./models");

// Import routes
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contacts");
const authMiddleware = require("./middleware/auth");

const app = express();
const port = 5500;

// 🔐 Load secrets from .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
const fast2smsApiKey = process.env.FAST2SMS_API_KEY;
const fast2smsRecipients = process.env.FAST2SMS_RECIPIENTS; // comma-separated numbers

const client = twilio(accountSid, authToken);

app.use(cors());
app.use(express.json());

// Initialize database
syncDatabase();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/sos", authMiddleware, require("./routes/sos"));

/**
 * 🔹 Route to send SMS via Fast2SMS (POST)
 */
app.post("/send-sms", authMiddleware, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Missing "message" in request body.',
    });
  }

  const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";

  const payload = {
    message: message,
    language: "english",
    route: "q",
    numbers: fast2smsRecipients,
  };

  const headers = {
    Authorization: fast2smsApiKey,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(FAST2SMS_URL, payload, { headers });

    if (response.data.return) {
      res.status(200).json({
        success: true,
        message: `SMS sent successfully to ${fast2smsRecipients}`,
        response: response.data,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send SMS",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("Fast2SMS Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Error while sending SMS",
      details: error.response?.data || error.message,
    });
  }
});

/**
 * 🔹 Route to make a call using Twilio (POST)
 */
app.post("/make-call", authMiddleware, async (req, res) => {
  const { to, message } = req.body;

  if (!message || !to) {
    return res.status(400).json({
      success: false,
      error: 'Missing "message" or "to" in request body',
    });
  }

  try {
    // If the message contains a map URL, extract the coordinates
    const coordMatch = message.match(/https:\/\/maps\.google\.com\/\?q=([-\d.]+),([-\d.]+)/);
    let finalMessage = message;

    if (coordMatch) {
      const [_, lat, lng] = coordMatch;
      const geoResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`
      );
      const geoData = await geoResponse.json();

      const address = geoData.results[0]?.formatted_address || `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
      finalMessage = message.replace(/https:\/\/maps\.google\.com[^\s]+/, address);
    }

    const cleanMessage = finalMessage
      .replace(/[&<>]/g, " ")
      .replace(/\n/g, ". ")
      .replace(/🚨/g, "SOS Alert: ")
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
    console.error("Error making call:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack,
    });
  }
});

// 🔥 Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
