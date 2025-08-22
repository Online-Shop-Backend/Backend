import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  payment_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  card_no: { type: String, required: true },
  cvv: { type: String, required: true },
  name_of_card: { type: String, required: true },
  expiry: { type: String, required: true },
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
