const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  cart_item_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant_id: { type: String },
  quantity: { type: Number, required: true },
  price_at_add: { type: Number, required: true },
});

module.exports = mongoose.model("CartItem", cartItemSchema);