const express = require("express");
const { Contact } = require("../models");
const axios = require("axios");

const router = express.Router();

// ✅ Fast2SMS config
const FAST2SMS_API_KEY =
  "zTXenxgJhCwoaPjcxdO4GGfExiX3JKQpBWmQA2xepZ8qyQpph69IvhWT50y5";
const FAST2SMS_API_URL = "https://www.fast2sms.com/dev/bulkV2";

// ✅ Updated: Shared function to send SMS using POST
async function sendFast2SMS(phoneNumbers, message) {
  const data = new URLSearchParams({
    message,
    language: "english",
    route: "q",
    numbers: phoneNumbers.join(","),
  });

  await axios.post(FAST2SMS_API_URL, data, {
    headers: {
      authorization: FAST2SMS_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
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
