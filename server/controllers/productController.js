const Product = require("../models/product");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bucket = require("../gcs");

// Utility: upload file to GCS and return its public URL
const uploadToGCS = async (localFile, folder, mimetype) => {
  const ext = path.extname(localFile.originalname);
  const gcsFileName = `${folder}/${uuidv4()}${ext}`;
  await bucket.upload(localFile.path, {
    destination: gcsFileName,
    resumable: false,
    public: true,
    metadata: {
      contentType: mimetype,
    },
  });
  fs.unlinkSync(localFile.path);
  return `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name, description, ingredients, hsn_code, price, gst_rate, vendor,
      meta_tag, meta_keyword, meta_title, quantity, delivery_details,
      perishable_status, certificate_validity, fssai_details, product_dimension,
      product_weight, category, subcategory, status, product_type,
      sale_price, discount, subscription
    } = req.body;

    const organic_certificate = req.files?.organic_certificate?.[0]
      ? await uploadToGCS(req.files.organic_certificate[0], "products", req.files.organic_certificate[0].mimetype)
      : "";

    const thumbnail = req.files?.thumbnail?.[0]
      ? await uploadToGCS(req.files.thumbnail[0], "products", req.files.thumbnail[0].mimetype)
      : "";

    const images = req.files?.images
      ? await Promise.all(req.files.images.map(file => uploadToGCS(file, "products", file.mimetype)))
      : [];

    const product = new Product({
      name, description, ingredients, hsn_code, gst_rate, price, meta_tag,
      meta_keyword, meta_title, quantity, vendor, delivery_details, perishable_status,
      organic_certificate, certificate_validity, fssai_details, product_dimension,
      product_weight, category, subcategory, images, thumbnail, status,
      product_type, sale_price, discount, subscription
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

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

exports.updateProduct = async (req, res) => {
  try {
    const {
      name, description, ingredients, hsn_code, gst_rate, meta_tag, meta_keyword,
      meta_title, vendor, price, quantity, delivery_details, perishable_status,
      certificate_validity, fssai_details, product_dimension, product_weight,
      category, subcategory, status, product_type, sale_price, discount, subscription
    } = req.body;

    const updateData = {
      name, description, ingredients, hsn_code, gst_rate, meta_tag, meta_keyword,
      meta_title, vendor, price, quantity, delivery_details, perishable_status,
      certificate_validity, fssai_details, product_dimension, product_weight,
      category, subcategory, status, product_type, sale_price, discount, subscription
    };

    if (req.files?.organic_certificate?.[0]) {
      updateData.organic_certificate = await uploadToGCS(
        req.files.organic_certificate[0], "products", req.files.organic_certificate[0].mimetype);
    }

    if (req.files?.thumbnail?.[0]) {
      updateData.thumbnail = await uploadToGCS(
        req.files.thumbnail[0], "products", req.files.thumbnail[0].mimetype);
    }

    if (req.files?.images?.length) {
      updateData.images = await Promise.all(
        req.files.images.map(file => uploadToGCS(file, "products", file.mimetype)));
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

exports.getProductByVendorId = async (req, res) => {
  try {
    const product = await Product.find({ vendor: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWebsiteProduct = async (req, res) => {
  try {
    const { product_type } = req.query;
    const filter = { status: 1 };
    if (product_type) filter.product_type = product_type;

    const products = await Product.find(filter);
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.searchProductsByText = async (req, res) => {
  try {
    const { q, minPrice, maxPrice } = req.query;
    const searchQuery = {};

    if (q?.trim()) {
      searchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { ingredients: { $regex: q, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = Number(minPrice);
      if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(searchQuery)
      .limit(10)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate('vendor', 'name');

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductByCategory = async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required." });
    }

    const searchQuery = { category };
    if (subcategory) searchQuery.subcategory = subcategory;

    const products = await Product.find(searchQuery);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
