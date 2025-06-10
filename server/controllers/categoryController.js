const Category = require("../models/Category");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bucket = require("../gcs"); // adjust path as needed

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, status } = req.body;
    let image_url = "";

    if (req.file) {
      const localPath = req.file.path;
      const ext = path.extname(req.file.originalname);
      const gcsFileName = `categories/${uuidv4()}${ext}`;
      const file = bucket.file(gcsFileName);

      await bucket.upload(localPath, {
        destination: gcsFileName,
        resumable: false,
        public: true,
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      image_url = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;
      fs.unlinkSync(localPath); // delete local file after upload
    }

    const category = new Category({ image_url, name, status });
    await category.save();

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { name, status } = req.body;
    let image_url = "";

    if (req.file) {
      const localPath = req.file.path;
      const ext = path.extname(req.file.originalname);
      const gcsFileName = `categories/${uuidv4()}${ext}`;
      const file = bucket.file(gcsFileName);

      await bucket.upload(localPath, {
        destination: gcsFileName,
        resumable: false,
        public: true,
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      image_url = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;
      fs.unlinkSync(localPath); // delete local file after upload
    }

    const updateData = { name, status };
    if (image_url) updateData.image_url = image_url;

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Single Category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk Delete Categories
exports.bulkDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No category IDs provided" });
    }

    const result = await Category.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} categories deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Change Category Status
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    // Ensure newStatus is either "1" or "0"
    if (!['1', '0'].includes(newStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status value. Use '1' or '0'." });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: `Category status updated to ${newStatus === '1' ? "Active" : "Inactive"}.`,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



exports.getAllCategoriesSubCategory = async (req, res) => {
  try {
    // First get all categories
    const categories = await Category.find();
    
    // Then get all subcategories
    const subcategories = await SubCategory.find();
    
    // Create a map to group subcategories by their category name
    const subcategoriesByCategory = subcategories.reduce((acc, subcategory) => {
      if (!acc[subcategory.category]) {
        acc[subcategory.category] = [];
      }
      acc[subcategory.category].push(subcategory);
      return acc;
    }, {});
    
    // Combine categories with their subcategories
    const result = categories.map(category => ({
      ...category.toObject(),
      subcategories: subcategoriesByCategory[category.name] || []
    }));
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};