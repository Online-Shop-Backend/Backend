const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  image_url: { type: String },
  category_name: { type: String },
  brand_name: { type: String },
  color: { type: String },
  size: { type: String },
});

module.exports = mongoose.model("Product", productSchema);
