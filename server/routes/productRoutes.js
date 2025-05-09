const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, "../uploads/products");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});

// File filter for image uploads (optional but recommended)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image and PDF files are allowed!"));
  }
};

const upload = multer({ storage, fileFilter });

// Upload fields
const cpUpload = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "thumbnail", maxCount: 1 },
  { name: "organic_certificate", maxCount: 1 },
]);

// Import controller
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  changeStatus,
} = require("../controllers/productController");

// Routes
router.post("/", cpUpload, createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id/status", changeStatus);
router.put("/:id", cpUpload, updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
