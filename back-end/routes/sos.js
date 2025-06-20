const express = require("express");
const { Contact } = require("../models");
const twilio = require("twilio");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Twilio config (replace with your credentials)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Route for voice detection
router.post("/voice", async (req, res) => {
  try {
    const { userId, name } = req.user;
    const contacts = await Contact.findAll({ where: { userId } });
    if (!contacts.length)
      return res.status(404).json({ message: "No contacts found" });

    const messages = contacts.map((contact) =>
      twilioClient.messages.create({
        body: `Emergency! ${name} needs help. Please check on them immediately.`,
        from: twilioPhone,
        to: contact.phone,
      })
    );
    await Promise.all(messages);

    res.json({
      message: "Emergency notification sent to contacts (voice detection)",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route for motion detection
router.post("/motion", async (req, res) => {
  try {
    const { userId, name } = req.user;
    const contacts = await Contact.findAll({ where: { userId } });
    if (!contacts.length)
      return res.status(404).json({ message: "No contacts found" });

    const messages = contacts.map((contact) =>
      twilioClient.messages.create({
        body: `Emergency! ${name} needs help. Please check on them immediately.`,
        from: twilioPhone,
        to: contact.phone,
      })
    );
    await Promise.all(messages);

    res.json({
      message: "Emergency notification sent to contacts (motion detection)",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
