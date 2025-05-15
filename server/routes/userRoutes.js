const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  changeStatus,
  sendRegistrationOtp,
  verifyRegistrationOtp
} = require("../controllers/userController");

// Multer storage setup (if user requires image upload in future)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/users/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.fieldname + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// If user has profile pic etc., use this. Otherwise, simple upload.none()
const singleUpload = upload.single("image");

// Routes
router.post("/", upload.none(), createUser); // User Registration
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", upload.none(), updateUser);
router.delete("/:id", deleteUser);
router.delete("/bulk", bulkDeleteUsers);
router.put("/:id/status", changeStatus);
router.post("/register/send-otp", upload.none(), sendRegistrationOtp);
router.post("/register/verify-otp", upload.none(), verifyRegistrationOtp);

module.exports = router;
