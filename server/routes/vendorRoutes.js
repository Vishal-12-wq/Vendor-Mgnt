const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  bulkDeleteVendors,
  changeStatus,
  sendOtpToMobile ,
  verifyOtp 
} = require("../controllers/vendorController");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/vendors/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.fieldname + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
});

// Multer Fields for Multiple File Uploads
const multiUpload = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "organic_certificate", maxCount: 1 },
  { name: "fssai_certificate", maxCount: 1 },
  { name: "signature", maxCount: 1 },
]);

// Vendor Routes
router.post("/", multiUpload, createVendor);
router.get("/", getAllVendors);
router.get("/:id", getVendorById);
router.put("/:id/status", changeStatus); // Status update only
router.put("/:id", multiUpload, updateVendor);
router.delete("/:id", deleteVendor);
router.delete("/bulkvendors", bulkDeleteVendors);
router.post("/send-otp", sendOtpToMobile);
router.post("/verify-otp", verifyOtp);
module.exports = router;
