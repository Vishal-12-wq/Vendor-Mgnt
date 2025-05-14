const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const subCategory = require("../models/subCategory");

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/subcategories/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage });

// Importing controller functions
const {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  bulkDeleteSubCategories,
  changeSubCategoryStatus,
  getSubCategoryByCategoryId
} = require("../controllers/subCategoryController");

// Routes
router.post("/", upload.single("image_url"), createSubCategory);
router.get("/", getAllSubCategories);
router.get("/:id", getSubCategoryById);
router.put("/:id/status", changeSubCategoryStatus);
router.put("/:id", upload.single("image_url"), updateSubCategory);
router.delete("/:id", deleteSubCategory);
router.delete("/bulk", bulkDeleteSubCategories); // cleaner URL
router.get("/category/:id", getSubCategoryByCategoryId);
module.exports = router;
