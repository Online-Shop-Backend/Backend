import express from "express";
const router = express.Router();
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";


// ✅ Simulated card validation function
function validateCard(card_no, cvv, expiry) {
  if (!card_no || card_no.length < 16) return false;
  if (!cvv || cvv.length !== 3) return false;
  if (!expiry) return false;
  return true; //
}

// CREATE payment
router.post("/", async (req, res) => {
  try {
    const { order_id, card_no, cvv, name_of_card, expiry } = req.body;

    // 1. Validate order exists
    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // 2. Validate card (fake)
    const isValid = validateCard(card_no, cvv, expiry);

    // 3. Create payment entry
    const payment = new Payment({
      order_id,
      card_no,
      cvv_validated: isValid,
      name_of_card,
      expiry,
      status: isValid ? "Success" : "Failed",
    });

    await payment.save();

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all payments
router.get("/", async (req, res) => {
  const payments = await Payment.find().populate("order_id");
  res.json(payments);
});

// READ single payment
router.get("/:id", async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("order_id");
  if (!payment) return res.status(404).json({ error: "Payment not found" });
  res.json(payment);
});

// UPDATE payment (only status or card details if needed)
router.put("/:id", async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedPayment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE payment
router.delete("/:id", async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
