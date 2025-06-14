const SubCategory = require("../models/subCategory");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bucket = require("../gcs"); // adjust path as needed

// Create SubCategory
exports.createSubCategory = async (req, res) => {
  try {
    const { category, name, status } = req.body;
    let image_url = "";

    if (req.file) {
      const localPath = req.file.path;
      const ext = path.extname(req.file.originalname);
      const gcsFileName = `subcategories/${uuidv4()}${ext}`;
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

    const subCategory = new SubCategory({ image_url, category, name, status });
    await subCategory.save();

    res.status(201).json({ success: true, data: subCategory });
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

// Get all SubCategories
exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: subCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get SubCategory by ID
exports.getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      return res.status(404).json({ success: false, message: "SubCategory not found." });
    }
    res.status(200).json({ success: true, data: subCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update SubCategory
exports.updateSubCategory = async (req, res) => {
  try {
    const { category, name, status } = req.body;
    let image_url = "";

    if (req.file) {
      const localPath = req.file.path;
      const ext = path.extname(req.file.originalname);
      const gcsFileName = `subcategories/${uuidv4()}${ext}`;
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

    const updateData = { category, name, status };
    if (image_url) updateData.image_url = image_url;

    const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!subCategory) {
      return res.status(404).json({ success: false, message: "SubCategory not found." });
    }

    res.status(200).json({ success: true, data: subCategory });
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

// Delete SubCategory
exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) {
      return res.status(404).json({ success: false, message: "SubCategory not found." });
    }
    res.status(200).json({ success: true, message: "SubCategory deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk Delete SubCategories
exports.bulkDeleteSubCategories = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No IDs provided." });
    }

    const result = await SubCategory.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} SubCategories deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change SubCategory Status
exports.changeSubCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    if (!["0", "1"].includes(newStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const subCategory = await SubCategory.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    if (!subCategory) {
      return res.status(404).json({ success: false, message: "SubCategory not found." });
    }

    res.status(200).json({
      success: true,
      message: `SubCategory status updated to ${newStatus === "1" ? "Active" : "Inactive"}.`,
      data: subCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getSubCategoryByCategoryId = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const limit = parseInt(req.query.limit); // get limit from query string

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const query = SubCategory.find({ category: categoryId }).sort({ createdAt: -1 }); // latest first

    if (!isNaN(limit) && limit > 0) {
      query.limit(limit);
    }

    const subcategories = await query.exec();

    res.json({ success: true, data: subcategories });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


