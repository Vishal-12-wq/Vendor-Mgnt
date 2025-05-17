const Cart = require("../models/Cart");
const Product = require("../models/product");
const { isValidObjectId } = require("mongoose");

// Helper function to get product price
const getProductPrice = async (productId) => {
  const product = await Product.findById(productId).select('price');
 
  return product.price ;
};

// Add to cart or update existing item
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity , order_type } = req.body;

    // Validate inputs
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    // Get product price
    const price = await getProductPrice(productId);
    if (price === null) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (price <= 0) {
      return res.status(400).json({ success: false, message: "Product price must be greater than 0" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{
          product: productId,
          quantity,
          order_type,
          price: price // Make sure to include the price field
        }]
      });
    } else {
      // Check if product already exists in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId && item.status === 'active'
      );

      if (existingItemIndex > -1) {
        // Update quantity if product exists
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item if product doesn't exist
        cart.items.push({
          product: productId,
          quantity,
          order_type,
          price: price // Make sure to include the price field
        });
      }
    }

    await cart.save();
    return res.status(200).json({ 
      success: true, 
      message: "Product added to cart",
      data: {
        cartId: cart._id,
        totalItems: cart.items.filter(item => item.status === 'active').length,
        totalAmount: cart.totalAmount
      }
    });

  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get user's cart with product details (READ-ONLY)
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name images price quantity status order_type',
        match: { status: '1' } // Only populate active products
      });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Filter out removed items and products that don't exist
    const activeItems = cart.items.filter(item => 
      item.status === 'active' && item.product !== null
    );

    return res.status(200).json({ 
      success: true, 
      data: {
        cartId: cart._id,
        order_type: cart.order_type,
        userId: cart.user,
        items: activeItems,
        totalItems: activeItems.length,
        totalAmount: activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
      }
    });

  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get cart items count
exports.getCartCount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const cart = await Cart.findOne({ user: userId });
    const count = cart ? cart.items.filter(item => item.status === 'active').length : 0;

    return res.status(200).json({ 
      success: true, 
      data: { count }
    });

  } catch (error) {
    console.error("Get cart count error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Validate inputs
    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs provided" });
    }
    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.status === 'active'
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return res.status(200).json({ 
      success: true, 
      message: "Cart updated",
      data: {
        cartId: cart._id,
        totalItems: cart.items.length,
        totalAmount: cart.totalAmount,
      }
    });

  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove item from cart (soft delete by changing status)
exports.removeCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs provided" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.status === 'active'
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    cart.items[itemIndex].status = 'removed';
    await cart.save();

    return res.status(200).json({ 
      success: true, 
      message: "Product removed from cart",
      data: {
        cartId: cart._id,
        totalItems: cart.items.filter(item => item.status === 'active').length,
        totalAmount: cart.totalAmount
      }
    });

  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Mark all items as removed instead of deleting them
    cart.items.forEach(item => {
      item.status = 'removed';
    });

    await cart.save();

    return res.status(200).json({ 
      success: true, 
      message: "Cart cleared",
      data: {
        cartId: cart._id,
        totalItems: 0,
        totalAmount: 0
      }
    });

  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};