const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
  address_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  line1: { type: String, required: true },
  city: { type: String, required: true },
  state_province: { type: String },
  postal_code: { type: String },
  country: { type: String },
});

module.exports = mongoose.model("Address", addressSchema);
