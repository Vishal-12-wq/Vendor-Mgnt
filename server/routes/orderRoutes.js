const express = require("express");
const router = express.Router();

const multer = require('multer');
const upload = multer();


const {
  checkout,
  orderHistory,
  changeOrderStatus,
  getAllOrders
} = require("../controllers/orderController");

router.post("/checkout",upload.none(), checkout);
router.get('/', getAllOrders);
router.get("/history/:userId", orderHistory);
router.put("/status",upload.none(), changeOrderStatus);

module.exports = router;
