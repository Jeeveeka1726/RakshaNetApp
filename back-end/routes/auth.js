const express = require("express")
const { User } = require("../models")
const { generateToken } = require("../utils/jwt")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

// Sign up route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, age } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      age: age || null,
    })

    // Generate token
    const token = generateToken(user.id, user.email)

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          age: user.age,
        },
        accessToken: token,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// Sign in route
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      })
    }

    // Find user
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      })
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      })
    }

    // Generate token
    const token = generateToken(user.id, user.email)

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          age: user.age,
        },
        accessToken: token,
      },
    })
  } catch (error) {
    console.error("Signin error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// Update profile route
router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, age } = req.body
    const userId = req.user.userId

    const updateData = {}
    if (name) updateData.name = name
    if (age !== undefined) updateData.age = age

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields to update",
      })
    }

    await User.update(updateData, { where: { id: userId } })

    const updatedUser = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "age"],
    })

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

module.exports = router
