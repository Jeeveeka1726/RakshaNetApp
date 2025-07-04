const express = require("express");
const { Contact } = require("../models");
const axios = require("axios");

const router = express.Router();

// Google Maps API Key (will be loaded from environment)
const GOOGLE_MAPS_API_KEY = "AIzaSyAeN6n8eMSKveBnlZT_oQQcgsFUfVjVfac";

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

// ✅ Helper function to get address from coordinates using Google Geocoding API
async function getAddressFromCoordinates(latitude, longitude) {
  if (!GOOGLE_MAPS_API_KEY) {
    return `Location: ${latitude}, ${longitude}`;
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    } else {
      return `Location: ${latitude}, ${longitude}`;
    }
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    return `Location: ${latitude}, ${longitude}`;
  }
}

// ✅ Voice SOS route with location support
router.post("/voice", async (req, res) => {
  try {
    const { userId, name } = req.user;
    const { latitude, longitude } = req.body;

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

    // Build message with location if provided
    let message = `🚨 SOS ALERT! 🚨\n${name} triggered an alert via RakshaNet!`;

    if (latitude && longitude) {
      try {
        const address = await getAddressFromCoordinates(latitude, longitude);
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += `\n\nLocation: ${address}\nMap Link: ${googleMapsLink}`;
      } catch (error) {
        console.error('Error processing location:', error);
        // Include raw coordinates if geocoding fails
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += `\n\nLocation: ${latitude}, ${longitude}\nMap Link: ${googleMapsLink}`;
      }
    }

    await sendFast2SMS(phoneNumbers, message);

    res.json({
      success: true,
      message: `SOS alert sent to ${phoneNumbers.length} emergency contacts`,
      contactsNotified: phoneNumbers.length,
      locationIncluded: !!(latitude && longitude),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ✅ Motion SOS route with location support
router.post("/motion", async (req, res) => {
  try {
    const { userId, name } = req.user;
    const { latitude, longitude } = req.body;

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

    // Build message with location if provided
    let message = `🚨 MOTION SOS ALERT! 🚨\n${name} triggered a motion alert via RakshaNet!`;

    if (latitude && longitude) {
      try {
        const address = await getAddressFromCoordinates(latitude, longitude);
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += `\n\nLocation: ${address}\nMap Link: ${googleMapsLink}`;
      } catch (error) {
        console.error('Error processing location:', error);
        // Include raw coordinates if geocoding fails
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += `\n\nLocation: ${latitude}, ${longitude}\nMap Link: ${googleMapsLink}`;
      }
    }

    await sendFast2SMS(phoneNumbers, message);

    res.json({
      success: true,
      message: `Motion SOS alert sent to ${phoneNumbers.length} emergency contacts`,
      contactsNotified: phoneNumbers.length,
      locationIncluded: !!(latitude && longitude),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
