const express = require("express");
const { Contact } = require("../models");
const axios = require("axios");

const router = express.Router();

// ✅ Fast2SMS config
const FAST2SMS_API_KEY =
  "iDJxaW8B6ze0pn2lO5NhgFufKH3TXMdytUQrsLqSmYAcCjZv1PA2fhW67eCH3y8pYZ4NIuvEsmjGQbUM";
const FAST2SMS_API_URL = "https://www.fast2sms.com/dev/bulkV2";

// ✅ Updated: Shared function to send SMS using GET
async function sendFast2SMS(phones, message) {
  try {
    for (const phone of phones) {
      await axios.get(FAST2SMS_API_URL, {
        params: {
          authorization: FAST2SMS_API_KEY,
          message,
          language: "english",
          route: "q",
          numbers: phone,
        },
      });
    }
    return {
      success: true,
      message: "OTP sent to all numbers",
      data: response.data,
    };
  } catch (err) {
    console.error("❌ Fast2SMS Error:", err.response?.data || err.message);
    throw new Error("Failed to send SMS");
  }
}

// ✅ Voice SOS route
router.post("/voice", async (req, res) => {
  try {
    const { userId, name } = req.user;

    const contacts = await Contact.findAll({
      where: { userId, isVerified: true },
    });

    if (!contacts.length) {
      return res.status(404).json({
        success: false,
        message: "No verified emergency contacts found",
      });
    }

    const phoneNumbers = contacts.map((contact) => contact.phone);
    const message = `🚨 VOICE SOS ALERT! 🚨\n${name} triggered a voice alert via RakshaNet!`;

    await sendFast2SMS(phoneNumbers, message);

    res.json({
      success: true,
      message: `Voice SOS alert sent to ${phoneNumbers.length} emergency contacts`,
      contactsNotified: phoneNumbers.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ✅ Motion SOS route
router.post("/motion", async (req, res) => {
  try {
    const { userId, name } = req.user;

    const contacts = await Contact.findAll({
      where: { userId, isVerified: true },
    });

    if (!contacts.length) {
      return res.status(404).json({
        success: false,
        message: "No verified emergency contacts found",
      });
    }

    const phoneNumbers = contacts.map((contact) => contact.phone);
    const message = `🚨 MOTION SOS ALERT! 🚨\n${name} triggered a motion alert via RakshaNet!`;

    await sendFast2SMS(phoneNumbers, message);

    res.json({
      success: true,
      message: `Motion SOS alert sent to ${phoneNumbers.length} emergency contacts`,
      contactsNotified: phoneNumbers.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
