const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },

    // Image stored directly in MongoDB as bytes
    image_data: { type: Buffer },
    image_mime: { type: String, trim: true },
    image_name: { type: String, trim: true },

    category_name: { type: String, trim: true },
    brand_name: { type: String, trim: true },
    color: { type: String, trim: true }, // hex (e.g. #ff00aa)
    size: { type: String, trim: true },
  },
  { timestamps: true }
);

productSchema.virtual("hasImage").get(function () {
  return !!(this.image_data && this.image_data.length);
});

module.exports = mongoose.model("Product", productSchema);
