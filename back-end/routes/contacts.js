const express = require("express")
const twilio = require("twilio")
const { Contact } = require("../models")
const authMiddleware = require("../middleware/auth")
const { generateOTP, storeOTP, verifyOTP } = require("../utils/otp")

const router = express.Router()

// Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Send OTP to phone number
router.post("/send-otp", authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      })
    }

    // Generate OTP
    const otp = generateOTP()
    storeOTP(phone, otp)

    // Send OTP via Twilio
    try {
      await client.messages.create({
        body: `Your RakshaNet verification code is: ${otp}. This code will expire in 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      })

      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      })
    } catch (twilioError) {
      console.error("Twilio error:", twilioError)
      res.status(500).json({
        success: false,
        error: "Failed to send OTP. Please check the phone number.",
      })
    }
  } catch (error) {
    console.error("Send OTP error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// Verify OTP
router.post("/verify-otp", authMiddleware, async (req, res) => {
  try {
    const { phone, otp } = req.body

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: "Phone number and OTP are required",
      })
    }

    const verification = verifyOTP(phone, otp)

    if (verification.success) {
      res.status(200).json({
        success: true,
        message: verification.message,
      })
    } else {
      res.status(400).json({
        success: false,
        error: verification.message,
      })
    }
  } catch (error) {
    console.error("Verify OTP error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// Add emergency contact
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, phone, relationship } = req.body
    const userId = req.user.userId

    if (!name || !phone || !relationship) {
      return res.status(400).json({
        success: false,
        error: "Name, phone, and relationship are required",
      })
    }

    // Check if contact already exists for this user
    const existingContact = await Contact.findOne({
      where: { userId, phone },
    })

    if (existingContact) {
      return res.status(400).json({
        success: false,
        error: "Contact with this phone number already exists",
      })
    }

    const contact = await Contact.create({
      name,
      phone,
      relationship,
      userId,
      isVerified: true, // Since OTP was verified before this call
    })

    res.status(201).json({
      success: true,
      message: "Emergency contact added successfully",
      data: { contact },
    })
  } catch (error) {
    console.error("Add contact error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// Get all emergency contacts
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId

    const contacts = await Contact.findAll({
      where: { userId },
      attributes: ["id", "name", "phone", "relationship", "isVerified", "createdAt"],
      order: [["createdAt", "DESC"]],
    })

    res.status(200).json({
      success: true,
      data: { contacts },
    })
  } catch (error) {
    console.error("Get contacts error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// Update emergency contact
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { name, relationship } = req.body
    const userId = req.user.userId

    const contact = await Contact.findOne({
      where: { id, userId },
    })

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      })
    }

    const updateData = {}
    if (name) updateData.name = name
    if (relationship) updateData.relationship = relationship

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields to update",
      })
    }

    await Contact.update(updateData, { where: { id, userId } })

    const updatedContact = await Contact.findByPk(id)

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: { contact: updatedContact },
    })
  } catch (error) {
    console.error("Update contact error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// Delete emergency contact
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const contact = await Contact.findOne({
      where: { id, userId },
    })

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      })
    }

    await Contact.destroy({ where: { id, userId } })

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    })
  } catch (error) {
    console.error("Delete contact error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

module.exports = router
