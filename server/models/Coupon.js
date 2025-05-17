const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Coupon code is required"],
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['flat', 'percentage'],
    required: [true, "Discount type is required"]
  },
  discountValue: {
    type: Number,
    required: [true, "Discount value is required"],
    min: [0, "Discount value cannot be negative"]
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: [0, "Minimum purchase cannot be negative"]
  },
  maxDiscount: {
    type: Number,
    min: [0, "Maximum discount cannot be negative"],
    // Optional - used only for percentage type
  },
  expiryDate: {
    type: Date,
    required: [true, "Expiry date is required"]
  },
  status: {
    type: String,
    enum: {
      values: ['1', '0'],
      message: 'Status must be either (Active) or (Inactive).'
    },
    default: "0"
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
couponSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Coupon", couponSchema);
