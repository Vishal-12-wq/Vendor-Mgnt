const express = require("express");
const router = express.Router();

const multer = require('multer');
const upload = multer();


const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  changeStatus
} = require("../controllers/couponController");

// Auth middleware (optional, e.g., admin-only access for managing coupons)
// router.use(authMiddleware);

// Admin routes
router.post("/", upload.none(), createCoupon);        // Create a new coupon
router.get("/", getAllCoupons);           // Get all coupons
router.put("/:id", upload.none(), updateCoupon);     // Update a coupon by ID
router.delete("/:id", deleteCoupon);  // Delete a coupon by ID
router.put("/:id/status", changeStatus); // Update only the status

// User route
router.post("/apply", upload.none(), applyCoupon);          // Apply coupon with cart total

module.exports = router;
