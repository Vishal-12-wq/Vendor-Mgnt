const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Banner = require("../models/Banner");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/banners/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Import Controller Functions
const {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  bulkDeleteBanners,
  changeBannerStatus,
  getWebsiteBanners
} = require("../controllers/bannerController");

// Routes
router.post("/", upload.single("image_url"), createBanner);
router.get("/", getAllBanners);
router.get("/website", getWebsiteBanners);
router.get("/:id", getBannerById);
router.put("/:id/status", changeBannerStatus);
router.put("/:id", upload.single("image_url"), updateBanner);
router.delete("/:id", deleteBanner);
router.delete("/bulkbanners", bulkDeleteBanners);

module.exports = router;