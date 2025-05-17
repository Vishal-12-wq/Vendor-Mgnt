const Coupon = require("../models/Coupon");

// Create Coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiryDate,
      status
    } = req.body;

    const coupon = new Coupon({
      code,
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      maxDiscount,
      expiryDate,
      status: status !== undefined ? status : true,
    });

    await coupon.save();

    res.status(201).json({ success: true, data: coupon });
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

// Get All Coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Coupon
exports.updateCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiryDate,
      status
    } = req.body;

    const updateData = {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiryDate,
      status
    };

    // Remove undefined fields (optional)
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({ success: true, data: coupon });
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

// Delete Coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk Delete Coupons
exports.bulkDeleteCoupons = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No coupon IDs provided" });
    }

    const result = await Coupon.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} coupons deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Apply Coupon
exports.applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || !cartTotal) {
        return res.status(400).json({
        success: false,
        message: "Coupon code and cart total are required."
        });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or inactive coupon." });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon has expired." });
    }

    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({ success: false, message: `Minimum purchase should be ₹${coupon.minPurchase}.` });
    }

    let discount = 0;

    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    } else {
      discount = (coupon.discountValue / 100) * cartTotal;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    const finalTotal = cartTotal - discount;

    res.status(200).json({
      success: true,
      discount,
      finalTotal: finalTotal >= 0 ? finalTotal : 0,
      message: "Coupon applied successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Change Category Status
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Ensure newStatus is either "1" or "0"
    if (!['1', '0'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value. Use '1' or '0'." });
    }

    const data = await Coupon.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!data) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({
      success: true,
      message: `Coupon status updated to ${status === '1' ? "Active" : "Inactive"}.`,
      data: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};