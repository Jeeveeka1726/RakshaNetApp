const express = require("express");
const { Contact, SOSEvent, User } = require("../models");
const axios = require("axios");

const router = express.Router();

// Google Maps API Key (will be loaded from environment)
const GOOGLE_MAPS_API_KEY = "AIzaSyAeN6n8eMSKveBnlZT_oQQcgsFUfVjVfac";

// ✅ Fast2SMS config
const FAST2SMS_API_KEY =
  "444tfVM3yX6xtznmLiAKsf5gzlAjN6O80rrmcFqH3vy7nocOYNFaThDwQ6jZ";
const FAST2SMS_API_URL = "https://www.fast2sms.com/dev/bulkV2";

// ✅ Updated: Shared function to send SMS using POST
async function sendFast2SMS(phoneNumbers, message) {
  try {
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
  } catch (error) {
    console.error("Error sending SMS via Fast2SMS:", error.response ? error.response.data : error.message);
    throw new Error("Balance is too low to send SMS");
  }
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
    console.log("Received SOS request:", req.body);
    const { userId, name } = req.user;
    const { latitude, longitude } = req.body;

    const contacts = await Contact.findAll({
      where: { userId, isVerified: true },
    });
    console.log("Verified contacts found:", contacts.length);
    if (!contacts.length) {
      return res.status(404).json({
        success: false,
        message: "No verified emergency contacts found",
      });
    }

    const phoneNumbers = contacts.map((contact) => contact.phone);

    // Build message with location if provided
    let message = `🚨 SOS ALERT! 🚨\n${name} triggered an alert via RakshaNet!`;
    let address = null;

    if (latitude && longitude) {
      try {
        address = await getAddressFromCoordinates(latitude, longitude);
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += `\n\nLocation: ${address}\nMap Link: ${googleMapsLink}`;
        console.log("Location processed:", address);
        console.log("Google Maps link:", googleMapsLink);
      } catch (error) {
        console.error('Error processing location:', error);
        // Include raw coordinates if geocoding fails
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += `\n\nLocation: ${latitude}, ${longitude}\nMap Link: ${googleMapsLink}`;
        address = `${latitude}, ${longitude}`;
      }
    }
    console.log("Final message to send:", message);
    await sendFast2SMS(phoneNumbers, message);
    console.log("SMS sent to contacts:", phoneNumbers.join(", "));
    // Log SOS event to database
    const sosEvent = await SOSEvent.create({
      userId,
      type: 'voice',
      latitude: latitude || null,
      longitude: longitude || null,
      address: address,
      contactsNotified: phoneNumbers.length,
      contactsData: contacts.map(contact => ({
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship
      }))
    });
    console.log("SOS event logged:", sosEvent.id);
    res.json({
      success: true,
      message: `SOS alert sent to ${phoneNumbers.length} emergency contacts`,
      contactsNotified: phoneNumbers.length,
      locationIncluded: !!(latitude && longitude),
      sosEventId: sosEvent.id,
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
    let address = null;

    if (latitude && longitude) {
      try {
        address = await getAddressFromCoordinates(latitude, longitude);
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += `\n\nLocation: ${address}\nMap Link: ${googleMapsLink}`;
      } catch (error) {
        console.error('Error processing location:', error);
        // Include raw coordinates if geocoding fails
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += `\n\nLocation: ${latitude}, ${longitude}\nMap Link: ${googleMapsLink}`;
        address = `${latitude}, ${longitude}`;
      }
    }

    // Log SOS event to database
    const sosEvent = await SOSEvent.create({
      userId,
      type: 'motion',
      latitude: latitude || null,
      longitude: longitude || null,
      address: address,
      contactsNotified: phoneNumbers.length,
      contactsData: contacts.map(contact => ({
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship
      }))
    });

    await sendFast2SMS(phoneNumbers, message);

    res.json({
      success: true,
      message: `Motion SOS alert sent to ${phoneNumbers.length} emergency contacts`,
      contactsNotified: phoneNumbers.length,
      locationIncluded: !!(latitude && longitude),
      sosEventId: sosEvent.id,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
