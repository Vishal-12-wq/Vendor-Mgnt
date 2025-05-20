const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      product_name: String,
      price: Number,
      quantity: Number
    }
  ],
  total_price: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Cancelled', 'Shipped', 'Delivered'], default: 'Pending' },
  payment_type: { 
    type: String,
    required: true 
  },
  transaction_id: { 
    type: String,
  },
  shipping_address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShippingAddress',
    required: true
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
orderSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);