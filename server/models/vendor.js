const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  // Owner Details
  owner_full_name: {
    type: String,
    // required: [true, "Owner full name is required."],
    trim: true
  },
  owner_phone: {
    type: String,
    // required: [true, "Owner phone number is required."],
    trim: true
  },
  owner_email: {
    type: String,
    // required: [true, "Owner email is required."],
    trim: true
  },

  // Company Details
  company_name: {
    type: String,
    // required: [true, "Company name is required."],
    trim: true
  },
  company_pan: {
    type: String,
    // required: [true, "PAN of the company is required."],
    trim: true
  },
  business_type: {
    type: String,
    // required: [true, "Business type is required."],
    trim: true
  },
  company_type: {
    type: String,
    // required: [true, "Company type is required."],
    trim: true
  },
  business_address: {
    type: String,
    // required: [true, "Registered business address is required."],
    trim: true
  },
  business_email: {
    type: String,
    // required: [true, "Business email is required."],
    trim: true
  },
  about_company: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  organic_certificate: {
    type: String
  },
  organic_certificate_validity: {
    type: Date
  },
  signature: {
    type: String
  },
  pickup_location: {
    type: String,
    trim: true
  },
  fssai_type: {
    type: String,
    trim: true
  },
  fssai_certificate: {
    type: String
  },
  fssai_number: {
    type: String,
    trim: true
  },
  fssai_validity: {
    type: Date
  },

  // Bank Details
  bank_name: {
    type: String,
    trim: true
  },
  account_number: {
    type: String,
    trim: true
  },
  ifsc_code: {
    type: String,
    trim: true
  },
  branch_address: {
    type: String,
    trim: true
  },

  // GST Details
  gstin: {
    type: String,
    trim: true
  },
  gst_address: {
    type: String,
    trim: true
  },
  gst_state: {
    type: String,
    trim: true
  },

  // Status
  status: {
    type: String,
    enum: {
      values: ["1", "0"],
      message: "Status must be either (1: Active) or (0: Inactive)."
    },
    default: '0'
  },


    // Status
  verified_status: {
    type: String,
    enum: {
      values: ["1", "0"],
      message: "Status must be either (1: Active) or (0: Inactive)."
    },
    default: '0'
  },


   otp: {
    type: String,
   },
  otpExpiresAt: {
    type: Date
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Vendor", vendorSchema);
