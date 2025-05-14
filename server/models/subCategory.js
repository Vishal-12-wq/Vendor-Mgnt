const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    image_url: {
      type: String,
      required: [true, "Image is required."],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Sub Category name is required."],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["1", "0"],
        message: "Status must be either '1' (Active) or '0' (Inactive).",
      },
      default: "0",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SubCategory", subCategorySchema);
