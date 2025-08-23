const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  feedback_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
});

module.exports = mongoose.model("CustomerFeedback", feedbackSchema);
