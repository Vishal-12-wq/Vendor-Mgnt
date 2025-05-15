const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartCount
} = require("../controllers/cartController");

// Auth middleware can be added here if needed
// router.use(authMiddleware);

router.post("/add", addToCart);
router.get("/:userId", getCart);
router.get("/count/:userId", getCartCount);
router.put("/update", updateCartItem);
router.delete("/remove", removeCartItem);
router.delete("/clear/:userId", clearCart);

module.exports = router;