const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  order_item_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant_id: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

module.exports = mongoose.model("OrderItem", orderItemSchema);