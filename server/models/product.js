const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required.'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required.'],
    trim: true
  },
  ingredients: {
    type: String,
    required: [true, 'Ingredients are required.'],
    trim: true
  },
  hsn_code: {
    type: String,
    required: [true, 'HSN code is required.'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required.'],
    min: [0, 'Price rate cannot be negative.'],
    default: '0'
  },
  gst_rate: {
    type: Number,
    required: [true, 'GST rate is required.'],
    min: [0, 'GST rate cannot be negative.']
  },
  meta_tag: {
    type: String,
    required: [true, 'Meta tag is required.'],
    trim: true
  },
  meta_keyword: {
    type: String,
    required: [true, 'Meta keyword is required.'],
    trim: true
  },
  meta_title: {
    type: String,
    required: [true, 'Meta title is required.'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required.'],
    min: [0, 'Quantity cannot be negative.']
  },
  delivery_details: {
    type: String,
    enum: {
      values: ['Local', 'Select States', 'PAN India'],
      message: '{VALUE} is not a valid delivery detail.'
    },
    // required: [true, 'Delivery details are required.']
  },
  perishable_status: {
    type: String,
    enum: {
      values: ['Perishable', 'Non Perishable'],
      message: '{VALUE} is not a valid perishable status.'
    },
    required: [true, 'Perishable status is required.']
  },
  organic_certificate: {
    type: String,
    required: [true, 'Organic certificate file is required.']
  },
  certificate_validity: {
    type: Date, // ✅ Better to store as a Date object if it's a date
    required: [true, 'Certificate validity is required.']
  },
  fssai_details: {
    type: String,
    required: [true, 'FSSAI details are required.'],
    trim: true
  },
  product_dimension: {
    type: String,
    required: [true, 'Product dimension is required.'],
    trim: true
    // You can add regex validation here if strict format like LxBxH is needed
  },
  product_weight: {
    type: String,
    required: [true, 'Product weight is required.'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId, // ✅ Prefer ref-based relationship
    ref: 'Category',
    required: [true, 'Category is required.']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId, // ✅ Prefer ref-based relationship
    ref: 'SubCategory',
    required: [true, 'Subcategory is required.']
  },
  images: {
    type: [String],
    validate: {
      validator: arr => arr.length <= 5,
      message: 'You can upload up to 5 product images.'
    }
  },
  thumbnail: {
    type: String,
    required: [true, 'Product thumbnail is required.']
  },
  status: {
    type: String,
    enum: ['1', '0'],
    default: '1'
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
