const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    image_url: {
      type: String,
      required: [true, "Image is required."],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // assuming you have a Category model
      required: [true, "Category is required."],
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
