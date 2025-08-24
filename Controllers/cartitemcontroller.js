// controllers/cartItemController.js
const CartItem = require("../models/CartItem");

// Add a new item to cart
exports.addItem = async (req, res) => {
  try {
    const { cart_id, product_id, variant_id, quantity, price_at_add } = req.body;

    const newItem = new CartItem({
      cart_id,
      product_id,
      variant_id,
      quantity,
      price_at_add,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all items in a cart
exports.getCartItems = async (req, res) => {
  try {
    const { cartId } = req.params;

    const items = await CartItem.find({ cart_id: cartId }).populate("product_id");

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update item quantity
exports.updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const updatedItem = await CartItem.findByIdAndUpdate(
      itemId,
      { quantity },
      { new: true }
    );

    if (!updatedItem) return res.status(404).json({ message: "Item not found" });

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove a single item
exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const deleted = await CartItem.findByIdAndDelete(itemId);

    if (!deleted) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Item removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Clear all items in a cart
exports.clearCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    await CartItem.deleteMany({ cart_id: cartId });

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

