const jwt = require("jsonwebtoken")
const { User } = require("../models")

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findByPk(decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token. User not found.",
      })
    }

    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
    }

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({
      success: false,
      error: "Invalid token.",
    })
  }
}

module.exports = authMiddleware
