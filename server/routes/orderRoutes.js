const express = require("express");
const router = express.Router();
const {
  checkout,
  orderHistory,
  changeOrderStatus,
  getAllOrders
} = require("../controllers/orderController");

router.post("/checkout", checkout);
router.get('/', getAllOrders);
router.get("/history/:userId", orderHistory);
router.put("/status", changeOrderStatus);

module.exports = router;
