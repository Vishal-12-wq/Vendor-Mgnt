const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  sendOtp,
  verifyOtp,
  registerUser,
  getAllUsers,
} = require("../controllers/userController");

// Multer Configuration (no uploads yet, but keeping it consistent)
const storage = multer.memoryStorage(); // Use memoryStorage since no file upload is needed now
const upload = multer({ storage });

// User Routes
router.post("/register/send-otp", upload.none(), sendOtp);
router.post("/register/verify-otp", upload.none(), verifyOtp);
router.post("/register", upload.none(), registerUser);
router.get("/", getAllUsers); // Optional: For admin

module.exports = router;
