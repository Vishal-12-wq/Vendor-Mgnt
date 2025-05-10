const Vendor = require("../models/vendor");

// Create Vendor
exports.createVendor = async (req, res) => {
  try {
    const files = req.files || {};
    const {
      owner_full_name, owner_phone, owner_email,
      company_name, company_pan, business_type, company_type, business_address,
      business_email, about_company, pickup_location, fssai_type, fssai_number,
      fssai_validity, organic_certificate_validity,
      bank_name, account_number, ifsc_code, branch_address,
      gstin, gst_address, gst_state, status
    } = req.body;

    const vendor = new Vendor({
      owner_full_name,
      owner_phone,
      owner_email,
      company_name,
      company_pan,
      business_type,
      company_type,
      business_address,
      business_email,
      about_company,
      logo: files.logo?.[0]?.filename || '',
      organic_certificate: files.organic_certificate?.[0]?.filename || '',
      organic_certificate_validity,
      signature: files.signature?.[0]?.filename || '',
      pickup_location,
      fssai_type,
      fssai_certificate: files.fssai_certificate?.[0]?.filename || '',
      fssai_number,
      fssai_validity,
      bank_name,
      account_number,
      ifsc_code,
      branch_address,
      gstin,
      gst_address,
      gst_state,
      status,
    });

    await vendor.save();
    res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Vendors
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Vendor by ID
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Vendor
exports.updateVendor = async (req, res) => {
  try {
    const files = req.files || {};
    const updateData = {
      ...req.body,
    };

    if (files.logo) updateData.logo = files.logo[0].filename;
    if (files.organic_certificate) updateData.organic_certificate = files.organic_certificate[0].filename;
    if (files.signature) updateData.signature = files.signature[0].filename;
    if (files.fssai_certificate) updateData.fssai_certificate = files.fssai_certificate[0].filename;

    const vendor = await Vendor.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Vendor
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    res.status(200).json({ success: true, message: "Vendor deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk Delete Vendors
exports.bulkDeleteVendors = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No vendor IDs provided" });
    }
    const result = await Vendor.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} vendors deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Change Vendor Status
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    if (!['1', '0'].includes(newStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status value. Use '1' or '0'." });
    }

    const vendor = await Vendor.findByIdAndUpdate(id, { status: newStatus }, { new: true });

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.status(200).json({
      success: true,
      message: `Vendor status updated to ${newStatus === '1' ? "Active" : "Inactive"}.`,
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.sendOtpToMobile = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number is required." });
  }

  try {
    const vendor = await Vendor.findOne({ owner_phone: phone });

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor with this phone number not found." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and expiry (10 min)
    vendor.otp = otp;
    vendor.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await vendor.save();

    // In production, send via SMS here (Twilio, Fast2SMS, etc.)
    console.log(`OTP for ${phone}: ${otp}`);

    return res.status(200).json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};



exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone and OTP are required." });
  }

  try {
    const vendor = await Vendor.findOne({ owner_phone: phone });

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found." });
    }

    // Check OTP match
    if (vendor.otp !== otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP." });
    }

    // Check if OTP is expired
    if (vendor.otpExpiresAt < new Date()) {
      return res.status(410).json({ success: false, message: "OTP has expired." });
    }

    // Optional: Clear OTP after successful login
    vendor.otp = null;
    vendor.otpExpiresAt = null;
    await vendor.save();

    // TODO: You can generate a token here if using JWT
    return res.status(200).json({ success: true, message: "OTP verified. Login successful." });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};
