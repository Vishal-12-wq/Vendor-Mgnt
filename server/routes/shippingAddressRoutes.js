const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();

const {
  createShippingAddress,
  getShippingAddressesByUser,
  updateShippingAddress,
  deleteShippingAddress,
  setDefaultAddress
} = require("../controllers/shippingAddressController");

// Auth middleware (assuming you have user authentication)
// router.use(authMiddleware);

// Shipping Address routes
router.post("/", upload.none(), createShippingAddress);          // Create new address
router.get("/user/:userId", getShippingAddressesByUser);        // Get all addresses for a user
router.put("/:id", upload.none(), updateShippingAddress);       // Update an address
router.delete("/:id", deleteShippingAddress);                   // Delete an address
router.put("/:id/set-default", setDefaultAddress);              // Set address as default

module.exports = router;