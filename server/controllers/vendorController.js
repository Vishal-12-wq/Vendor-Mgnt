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
