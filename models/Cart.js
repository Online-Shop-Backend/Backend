const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  cart_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
