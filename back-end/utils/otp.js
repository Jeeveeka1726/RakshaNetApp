// Simple in-memory OTP storage (in production, use Redis or database)
const otpStorage = new Map()

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

const storeOTP = (phone, otp) => {
  otpStorage.set(phone, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  })
}

const verifyOTP = (phone, otp) => {
  const stored = otpStorage.get(phone)

  if (!stored) {
    return { success: false, message: "OTP not found or expired" }
  }

  if (Date.now() > stored.expiresAt) {
    otpStorage.delete(phone)
    return { success: false, message: "OTP expired" }
  }

  if (stored.otp !== otp) {
    return { success: false, message: "Invalid OTP" }
  }

  otpStorage.delete(phone)
  return { success: true, message: "OTP verified successfully" }
}

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
}
