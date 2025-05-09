const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Category = require("../models/Category");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/categories/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Import Controller Functions
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  changeStatus,
} = require("../controllers/categoryController");

// Routes
router.post("/", upload.single("image_url"), createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id/status", changeStatus); // Update only the status
router.put("/:id", upload.single("image_url"), updateCategory);
router.delete("/:id", deleteCategory);
router.delete("/bulkcategories", bulkDeleteCategories);

module.exports = router;
