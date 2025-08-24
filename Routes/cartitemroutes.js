const express = require("express");
const router = express.Router();
const Cart = require("../models/CartItem");
const cartitemcontroller = require("../Controllers/cartitemcontroller");

router.post("/", cartitemcontroller.addItem);               // Add item
router.get("/:cartId", cartitemcontroller.getCartItems);    // Get items in cart
router.put("/:itemId", cartitemcontroller.updateItem);      // Update quantity
router.delete("/:itemId", cartitemcontroller.removeItem);   // Remove item
router.delete("/clear/:cartId", cartitemcontroller.clearCart); // Clear cart

module.exports = router;
