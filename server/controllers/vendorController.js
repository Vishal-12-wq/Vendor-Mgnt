const Vendor = require("../models/vendor");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const bucket = require("../gcs"); // Make sure this path is correct


// Create Vendor
exports.createVendor = async (req, res) => {
  try {
    const { owner_phone, adminvalue } = req.body;
    const files = req.files || {};

    let vendor;

    if (adminvalue == 'admin') {
      vendor = new Vendor();
      vendor.owner_phone = owner_phone;
    } else {
      vendor = await Vendor.findOne({ owner_phone });

      if (!vendor) {
        return res.status(404).json({ success: false, message: "Vendor not found or OTP not verified." });
      }

      if (vendor.status == '1') {
        return res.status(404).json({ success: false, message: "Vendor Phone Number is already Register." });
      }
    }

    // Handle file upload to GCS
    const uploadToGCS = async (file, folder) => {
      const localPath = file.path;
      const ext = path.extname(file.originalname);
      const gcsFileName = `${folder}/${uuidv4()}${ext}`;
      const bucketFile = bucket.file(gcsFileName);

      await bucket.upload(localPath, {
        destination: gcsFileName,
        resumable: false,
        public: true,
        metadata: {
          contentType: file.mimetype,
        },
      });

      fs.unlinkSync(localPath); // Delete local file
      return `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;
    };

    if (files.logo) vendor.logo = await uploadToGCS(files.logo[0], "vendors/logo");
    if (files.organic_certificate) vendor.organic_certificate = await uploadToGCS(files.organic_certificate[0], "vendors/organic_certificate");
    if (files.signature) vendor.signature = await uploadToGCS(files.signature[0], "vendors/signature");
    if (files.fssai_certificate) vendor.fssai_certificate = await uploadToGCS(files.fssai_certificate[0], "vendors/fssai_certificate");

    // Update vendor with full details
    vendor.owner_full_name = req.body.owner_full_name;
    vendor.owner_email = req.body.owner_email;
    vendor.company_name = req.body.company_name;
    vendor.company_pan = req.body.company_pan;
    vendor.business_type = req.body.business_type;
    vendor.company_type = req.body.company_type;
    vendor.business_address = req.body.business_address;
    vendor.business_email = req.body.business_email;
    vendor.about_company = req.body.about_company;
    vendor.pickup_location = req.body.pickup_location;
    vendor.fssai_type = req.body.fssai_type;
    vendor.fssai_number = req.body.fssai_number;
    vendor.fssai_validity = req.body.fssai_validity;
    vendor.organic_certificate_validity = req.body.organic_certificate_validity;
    vendor.bank_name = req.body.bank_name;
    vendor.account_number = req.body.account_number;
    vendor.ifsc_code = req.body.ifsc_code;
    vendor.branch_address = req.body.branch_address;
    vendor.gstin = req.body.gstin;
    vendor.gst_address = req.body.gst_address;
    vendor.gst_state = req.body.gst_state;
    vendor.status = req.body.status || "1"; // default active

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

exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const uploadImage = async (file, folder) => {
      const ext = path.extname(file.originalname);
      const gcsFileName = `${folder}/${uuidv4()}${ext}`;
      const localPath = file.path;

      await bucket.upload(localPath, {
        destination: gcsFileName,
        resumable: false,
        public: true,
        metadata: { contentType: file.mimetype },
      });

      fs.unlinkSync(localPath);
      return `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;
    };

    if (req.files.logo) {
      updateData.logo = await uploadImage(req.files.logo[0], 'vendors/logo');
    }

    if (req.files.organic_certificate) {
      updateData.organic_certificate = await uploadImage(req.files.organic_certificate[0], 'vendors/organic_certificate');
    }

    if (req.files.signature) {
      updateData.signature = await uploadImage(req.files.signature[0], 'vendors/signature');
    }

    if (req.files.fssai_certificate) {
      updateData.fssai_certificate = await uploadImage(req.files.fssai_certificate[0], 'vendors/fssai_certificate');
    }

    const vendor = await Vendor.findByIdAndUpdate(id, updateData, { new: true });

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    console.error("Update Vendor Error:", error);
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


exports.sendRegistrationOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number is required." });
  }

  try {
    let vendor = await Vendor.findOne({ owner_phone: phone });

    if (vendor) {
      // If vendor exists but status is empty (i.e., not fully registered), allow OTP
      // if (!vendor.status || vendor.status.trim() === "") {
        vendor.otp = "1234";
        vendor.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await vendor.save({ validateBeforeSave: false });

        return res.status(200).json({ success: true, message: "OTP re-sent to phone." });
      // } 
      // else {
      //   return res.status(400).json({ success: false, message: "Vendor already registered." });
      // }
    }

    // New temporary vendor
    vendor = new Vendor({
      owner_phone: phone,
      otp: "1234",
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await vendor.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "OTP sent successfully to phone." });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



exports.verifyRegistrationOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone and OTP required." });
  }

  try {
    const vendor = await Vendor.findOne({ owner_phone: phone });

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found." });
    }

    if (vendor.otp !== otp) {
      return res.status(401).json({ success: false, message: "Incorrect OTP." });
    }

    if (vendor.otpExpiresAt < new Date()) {
      return res.status(410).json({ success: false, message: "OTP expired." });
    }

    // Clear OTP after verification
    vendor.otp = null;
    vendor.otpExpiresAt = null;
    await vendor.save();

    // Generate JWT Token
    const token = jwt.sign(
      { vendorId: vendor._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified. Proceed to registration.",
      status: vendor.status,
      user_id: vendor._id,
      token: token,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

