const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  image_url: {
    type: String,
    required: [true, 'Image is required.']
  },
  title: {
    type: String,
    required: [true, 'Title is required.'],
    trim: true
  },
  sub_title: {
    type: String,
    required: [true, 'Sub title is required.'],
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

module.exports = mongoose.model("Banner", bannerSchema);