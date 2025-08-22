import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  cart_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
