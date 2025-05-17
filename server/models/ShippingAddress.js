const mongoose = require("mongoose");

const shippingAddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  },
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true
  },
  place: {
    type: String,
    required: [true, "Place is required"],
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true
  },
  district: {
    type: String,
    required: [true, "District is required"],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, "Pincode is required"],
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update `updatedAt` on every save
shippingAddressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("ShippingAddress", shippingAddressSchema);