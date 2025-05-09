const Product = require("../models/product");

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      ingredients,
      hsn_code,
      gst_rate,
      meta_tag,
      meta_keyword,
      meta_title,
      quantity,
      delivery_details,
      perishable_status,
      certificate_validity,
      fssai_details,
      product_dimension,
      product_weight,
      category,
      subcategory,
      status
    } = req.body;

    const organic_certificate = req.files?.organic_certificate?.[0]?.filename || "";
    const thumbnail = req.files?.thumbnail?.[0]?.filename || "";
    const images = req.files?.images?.map(file => file.filename) || [];

    const product = new Product({
      name,
      description,
      ingredients,
      hsn_code,
      gst_rate,
      meta_tag,
      meta_keyword,
      meta_title,
      quantity,
      delivery_details,
      perishable_status,
      organic_certificate,
      certificate_validity,
      fssai_details,
      product_dimension,
      product_weight,
      category,
      subcategory,
      images,
      thumbnail,
      status
    });

    await product.save();

    res.status(201).json({ success: true, data: product });
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

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      ingredients,
      hsn_code,
      gst_rate,
      meta_tag,
      meta_keyword,
      meta_title,
      quantity,
      delivery_details,
      perishable_status,
      certificate_validity,
      fssai_details,
      product_dimension,
      product_weight,
      category,
      subcategory,
      status
    } = req.body;

    const updateData = {
      name,
      description,
      ingredients,
      hsn_code,
      gst_rate,
      meta_tag,
      meta_keyword,
      meta_title,
      quantity,
      delivery_details,
      perishable_status,
      certificate_validity,
      fssai_details,
      product_dimension,
      product_weight,
      category,
      subcategory,
      status
    };

    if (req.files?.organic_certificate?.[0]) {
      updateData.organic_certificate = req.files.organic_certificate[0].filename;
    }

    if (req.files?.thumbnail?.[0]) {
      updateData.thumbnail = req.files.thumbnail[0].filename;
    }

    if (req.files?.images?.length) {
      updateData.images = req.files.images.map(file => file.filename);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, data: product });
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

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk Delete Products
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No IDs provided." });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} products deleted successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change Product Status
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    if (!["0", "1"].includes(newStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.status(200).json({
      success: true,
      message: `Product status updated to ${newStatus === "1" ? "Active" : "Inactive"}.`,
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
