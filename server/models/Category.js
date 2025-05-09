const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  image_url: {
    type: String,
    required: [true, 'Image is required.']
  },
  name: {
    type: String,
    required: [true, 'Category name is required.'],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['1', '0'],
      message: 'Status must be either (Active) or (Inactive).'
    },
    default: "0"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Category", categorySchema);
