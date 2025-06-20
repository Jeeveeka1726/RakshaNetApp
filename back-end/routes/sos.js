const express = require("express");
const { Contact } = require("../models");
const twilio = require("twilio");

const router = express.Router();

// Twilio config
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Route for voice detection
router.post("/voice", async (req, res) => {
  try {
    const { userId, name } = req.user;

    // Get user's emergency contacts
    const contacts = await Contact.findAll({
      where: { userId, isVerified: true },
    });

    if (!contacts.length) {
      return res.status(404).json({
        success: false,
        message: "No verified emergency contacts found",
      });
    }

    // Send SMS to all emergency contacts
    const messagePromises = contacts.map((contact) =>
      twilioClient.messages
        .create({
          body: `🚨 VOICE SOS ALERT! 🚨\n\n${name} triggered an emergency voice alert and needs immediate help!\n\nThis is an automated emergency message from RakshaNet. Please contact them immediately.`,
          from: twilioPhone,
          to: contact.phone,
        })
        .catch((error) => {
          console.error(`Failed to send SMS to ${contact.phone}:`, error);
          return null;
        })
    );

    const results = await Promise.allSettled(messagePromises);
    const successCount = results.filter(
      (result) => result.status === "fulfilled" && result.value
    ).length;

    res.json({
      success: true,
      message: `Voice SOS alert sent to ${successCount} of ${contacts.length} emergency contacts`,
      contactsNotified: successCount,
      totalContacts: contacts.length,
    });
  } catch (err) {
    console.error("Voice SOS error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Route for motion detection
router.post("/motion", async (req, res) => {
  try {
    const { userId, name } = req.user;

    // Get user's emergency contacts
    const contacts = await Contact.findAll({
      where: { userId, isVerified: true },
    });

    if (!contacts.length) {
      return res.status(404).json({
        success: false,
        message: "No verified emergency contacts found",
      });
    }

    // Send SMS to all emergency contacts
    const messagePromises = contacts.map((contact) =>
      twilioClient.messages
        .create({
          body: `🚨 MOTION SOS ALERT! 🚨\n\n${name} triggered an emergency motion alert (shake detection) and needs immediate help!\n\nThis is an automated emergency message from RakshaNet. Please contact them immediately.`,
          from: twilioPhone,
          to: contact.phone,
        })
        .catch((error) => {
          console.error(`Failed to send SMS to ${contact.phone}:`, error);
          return null;
        })
    );

    const results = await Promise.allSettled(messagePromises);
    const successCount = results.filter(
      (result) => result.status === "fulfilled" && result.value
    ).length;

    res.json({
      success: true,
      message: `Motion SOS alert sent to ${successCount} of ${contacts.length} emergency contacts`,
      contactsNotified: successCount,
      totalContacts: contacts.length,
    });
  } catch (err) {
    console.error("Motion SOS error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
