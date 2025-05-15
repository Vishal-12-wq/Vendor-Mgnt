const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: [true, "User name is required"]
  },
  phone: {
    type: String,
    // required: [true, "Phone number is required"],
    unique: true,
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"]
  },
  email: {
    type: String,
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
    sparse: true // allows multiple docs with null/undefined
  },
  otp: {
    type: String
  },
  otpExpiresAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['0', '1'],
    default: '0' // 0 = Unverified, 1 = Verified
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
