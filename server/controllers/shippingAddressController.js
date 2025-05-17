const ShippingAddress = require("../models/ShippingAddress");

// Create Shipping Address
exports.createShippingAddress = async (req, res) => {
  try {
    const {
      user,
      fullName,
      phoneNumber,
      address,
      place,
      landmark,
      state,
      district,
      pincode,
      isDefault
    } = req.body;

    // If setting as default, unset any existing default addresses for this user
    if (isDefault) {
      await ShippingAddress.updateMany(
        { user },
        { $set: { isDefault: false } }
      );
    }

    const shippingAddress = new ShippingAddress({
      user,
      fullName,
      phoneNumber,
      address,
      place,
      landmark,
      state,
      district,
      pincode,
      isDefault: isDefault || false
    });

    await shippingAddress.save();

    res.status(201).json({ success: true, data: shippingAddress });
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

// Get Shipping Addresses by User ID
exports.getShippingAddressesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const addresses = await ShippingAddress.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
    
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Shipping Address
exports.updateShippingAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      phoneNumber,
      address,
      place,
      landmark,
      state,
      district,
      pincode,
      isDefault
    } = req.body;

    const updateData = {
      fullName,
      phoneNumber,
      address,
      place,
      landmark,
      state,
      district,
      pincode,
      isDefault
    };

    // If setting as default, unset any existing default addresses for this user
    if (isDefault) {
      const addressToUpdate = await ShippingAddress.findById(id);
      if (addressToUpdate) {
        await ShippingAddress.updateMany(
          { user: addressToUpdate.user, _id: { $ne: id } },
          { $set: { isDefault: false } }
        );
      }
    }

    const updatedAddress = await ShippingAddress.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, data: updatedAddress });
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

// Delete Shipping Address
exports.deleteShippingAddress = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedAddress = await ShippingAddress.findByIdAndDelete(id);
    
    if (!deletedAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    
    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Set Default Shipping Address
exports.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    
    const address = await ShippingAddress.findById(id);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    
    // Unset all other default addresses for this user
    await ShippingAddress.updateMany(
      { user: address.user, _id: { $ne: id } },
      { $set: { isDefault: false } }
    );
    
    // Set this address as default
    address.isDefault = true;
    await address.save();
    
    res.status(200).json({ 
      success: true, 
      message: "Default address updated successfully",
      data: address
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};