const Product = require("../models/product");

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      ingredients,
      hsn_code,
      price,
      gst_rate,
      vendor,
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
      status,

      top_product,
      upcomming_product,
      best_deal,
      sale_price,
      discount
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
      price,
      meta_tag,
      meta_keyword,
      meta_title,
      quantity,
      vendor,
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
      status,

      top_product,
      upcomming_product,
      best_deal,
      sale_price,
      discount
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
      vendor,
      price,
      quantity,
      delivery_details,
      perishable_status,
      certificate_validity,
      fssai_details,
      product_dimension,
      product_weight,
      category,
      subcategory,
      status,


      top_product,
      upcomming_product,
      best_deal,
      sale_price,
      discount
    } = req.body;

    const updateData = {
      name,
      description,
      ingredients,
      hsn_code,
      gst_rate,
      meta_tag,
      meta_keyword,
      vendor,
      meta_title,
      quantity,
      delivery_details,
      perishable_status,
      certificate_validity,
      fssai_details,
      price,
      product_dimension,
      product_weight,
      category,
      subcategory,
      status,



      top_product,
      upcomming_product,
      best_deal,
      sale_price,
      discount
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



// Get Product by Vendor ID
exports.getProductByVendorId = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.find({ vendor : id});
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get active products for website display
exports.getWebsiteProduct = async (req, res) => {
  try {
    const products = await Product.find({ status: 1 });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products
    });
  } catch (error) {
    console.error("Get Website Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



exports.searchProductsByText = async (req, res) => {
  try {
    const { q, minPrice, maxPrice } = req.query;
    
    // Build the search query
    const searchQuery = {};
    
    // Text search (optional)
    if (q && q.trim() !== '') {
      searchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { ingredients: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Price range filtering (optional)
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = Number(minPrice);
      if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(searchQuery)
      .limit(10)
      .populate('category', 'name') // Optional: populate related fields
      .populate('subcategory', 'name')
      .populate('vendor', 'name');

    res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



exports.getProductByCategory = async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    
    // Build the search query
    const searchQuery = {};
    
    // Category filtering (required)
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required."
      });
    }
    searchQuery.category = category;
    
    // Subcategory filtering (optional)
    if (subcategory) {
      searchQuery.subcategory = subcategory;
    }

    const products = await Product.find(searchQuery);
    res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};