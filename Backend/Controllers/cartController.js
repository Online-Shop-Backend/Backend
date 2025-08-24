
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem"); 

// Create a new cart
exports.createCart = async (req, res) => {
  try {
    const { user_id } = req.body;

    const cart = new Cart({ user_id });
    await cart.save();

    res.status(201).json({ message: "Cart created successfully", Cart });
  } catch (error) {
    res.status(500).json({ message: "Error creating cart", error });
  }
};


// Get cart by user_id
exports.getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ user_id: userId }).populate("user_id");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error });
  }
};
// Delete a cart
exports.deleteCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await Cart.findByIdAndDelete(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json({ message: "Cart deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting cart", error });
  }
};
// Add item to cart (if using CartItem model)
exports.addItemToCart = async (req, res) => {
  try {
    const { cart_id, product_id, variant_id, quantity } = req.body;

    const cartItem = new CartItem({
      cart_id,
      product_id,
      variant_id,
      quantity,
    });

    await CartItem.save();
    res.status(201).json({ message: "Item added to cart", CartItem });
  } catch (error) {
    res.status(500).json({ message: "Error adding item to cart", error });
  }
};

// Get items in cart
exports.getCartItems = async (req, res) => {
  try {
    const { cartId } = req.params;

    const items = await CartItem.find({ cart_id: cartId }).populate("product_id");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart items", error });
  }
};