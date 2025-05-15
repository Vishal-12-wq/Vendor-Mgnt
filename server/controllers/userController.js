const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Send OTP
exports.sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number is required." });
  }

  try {
    let user = await User.findOne({ phone });

    if (user) {
      user.otp = "1234"; // Replace with actual OTP generation
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      await user.save({ validateBeforeSave: false });

      return res.status(200).json({ success: true, message: "OTP re-sent to phone." });
    }

    // New user
    user = new User({
      phone,
      otp: "1234",
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "OTP sent successfully to phone." });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone and OTP required." });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ success: false, message: "Incorrect OTP." });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(410).json({ success: false, message: "OTP expired." });
    }

    user.otp = null;
    user.otpExpiresAt = null;
    user.status = "1"; // Mark as verified
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified.",
      user_id: user._id,
      token,
      status: user.status
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Register User (after OTP verification)
exports.registerUser = async (req, res) => {
  const { phone, name, email } = req.body;

  try {
    const user = await User.findOne({ phone });

    if (!user || user.status !== "1") {
      return res.status(403).json({ success: false, message: "OTP not verified or user not found." });
    }

    user.name = name;
    user.email = email;

    await user.save();

    return res.status(200).json({ success: true, message: "User registered successfully.", data: user });
  } catch (error) {
    console.error("Register User Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Optional: Get All Users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
