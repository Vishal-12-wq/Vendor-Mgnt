const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Send OTP
exports.sendRegistrationOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number is required." });
  }

  try {
    let user = await User.findOne({ phone });

    if (user) {
      user.otp = "1234"; // In real case, generate random OTP
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
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
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify OTP
exports.verifyRegistrationOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone and OTP required." });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.otp !== otp) return res.status(401).json({ success: false, message: "Incorrect OTP." });
    if (user.otpExpiresAt < new Date()) return res.status(410).json({ success: false, message: "OTP expired." });

    // Clear OTP
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified. Proceed to registration.",
      status: user.status,
      user_id: user._id,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create User (Full Registration)
exports.createUser = async (req, res) => {
  try {
    const { phone, name, email } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or OTP not verified." });
    }

    if (user.status === '1') {
      return res.status(400).json({ success: false, message: "User already registered." });
    }

    user.name = name;
    user.email = email;
    user.status = "1";

    await user.save();

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk Delete
exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No user IDs provided" });
    }

    const result = await User.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} users deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Change Status
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    if (!['1', '0'].includes(newStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status value. Use '1' or '0'." });
    }

    const user = await User.findByIdAndUpdate(id, { status: newStatus }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: `User status updated to ${newStatus === '1' ? "Active" : "Inactive"}.`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
