import mongoose from "mongoose";
import crypto from "crypto"; //new

const paymentSchema = new mongoose.Schema({
  payment_id: { type: mongoose.Schema.Types.ObjectId, auto: true },

  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },

  card_no: { type: String, required: true },
  cvv_validated: { type: Boolean, default: false },
  name_of_card: { type: String, required: true },
  expiry: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Success", "Failed"],
    default: "Pending",
  },

  createdAt: { type: Date, default: Date.now },
});
//mask card number before saving
paymentSchema.pre("save", function (next) {
  if (this.card_no) {
    this.card_no = this.card_no.replace(/\d(?=\d{4})/g, "*"); // **** **** **** 1234
  }
  next();
});

export default mongoose.model("Payment", paymentSchema);
