const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  address_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  total: { type: Number, required: true },
});

module.exports = mongoose.model("Order", orderSchema);
