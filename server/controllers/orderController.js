const Cart = require("../models/Cart");
const Order = require("../models/order");

exports.checkout = async (req, res) => {
  try {
    const { user_id, payment_type, transaction_id, shipping_address } = req.body;

    // Validate payment details
    if (!payment_type) {
      return res.status(400).json({ success: false, message: "Payment type is required" });
    }

    // if (payment_type !== 'COD' && !transaction_id) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: "Transaction ID is required for non-COD payments" 
    //   });
    // }

    // Find the cart
    const cart = await Cart.findOne({ user: user_id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const items = cart.items.map(item => ({
      product_id: item.product,
      product_name: item.product_name, // Make sure this is populated in cart
      price: item.price,
      quantity: item.quantity,
      order_type: item.order_type
    }));

    const total_price = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = new Order({
      user_id,
      items,
      total_price,
      payment_type,
      transaction_id: payment_type === 'COD' ? undefined : transaction_id,
      shipping_address
    });

    await newOrder.save();

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(200).json({ 
      success: true, 
      message: "Order placed successfully", 
      order: newOrder 
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Other controller methods (orderHistory, getAllOrders, changeOrderStatus) remain the same
// but will now include the new fields in their responses

exports.orderHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user_id: userId })
      .populate('user_id', 'name') // get user name
      .populate('items.product_id', 'name thumbnail price') // get product details for each item
      .populate('shipping_address', 'user fullName phoneNumber addressLine1 addressLine2 city state zipCode country') // adjust fields as per ShippingAddress schema
      .sort({ created_at: -1 }); // use snake_case as per your schema

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Order History Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};




// Get all orders (with latest first)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user_id', 'name') // Populate user name
      .populate('items.product_id', 'name') // Populate product name from Product model
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



// Change order status
exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: "Order ID and status are required" });
    }

    // Validate status value
    const validStatuses = ["Pending", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Change Order Status Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
