// controllers/order.controller.js
import mongoose from "mongoose";

import User from "../models/User.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Address from "../models/Address.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

/**
 * Helper: (re)calculate order total from its items.
 */
async function recalcOrderTotal(orderId, session) {
  const items = await OrderItem.find({ order_id: orderId }).session(session);
  const total = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  await Order.updateOne({ _id: orderId }, { $set: { total } }).session(session);
  return total;
}

/**
 * POST /api/orders/from-cart
 * Body: { user_id, address_id }
 * - Reads all CartItems for user's Cart
 * - Validates stock & product existence
 * - Creates Order + OrderItems (price snapshot from Product.price)
 * - Decrements Product stock
 * - Clears CartItems
 */
export const placeOrderFromCart = async (req, res) => {
  const { user_id, address_id } = req.body;

  if (!user_id || !address_id) {
    return res.status(400).json({ message: "user_id and address_id are required" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Validate user & address ownership
    const [user, address] = await Promise.all([
      User.findById(user_id).session(session),
      Address.findOne({ _id: address_id, user_id }).session(session),
    ]);

    if (!user) throw new Error("User not found");
    if (!address) throw new Error("Address not found for this user");

    // Load cart and items
    const cart = await Cart.findOne({ user_id }).session(session);
    if (!cart) throw new Error("Cart not found for user");

    const cartItems = await CartItem.find({ cart_id: cart._id }).session(session);
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate product stock and compute line prices
    const productIds = cartItems.map(ci => ci.product_id);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const productMap = new Map(products.map(p => [String(p._id), p]));

    for (const ci of cartItems) {
      const p = productMap.get(String(ci.product_id));
      if (!p) throw new Error(`Product ${ci.product_id} not found`);
      if (ci.quantity <= 0) throw new Error("Quantity must be > 0");
      if (p.stock < ci.quantity) {
        throw new Error(`Insufficient stock for product "${p.name}" (have ${p.stock}, need ${ci.quantity})`);
      }
    }

    // Create order
    const order = await Order.create([{
      user_id,
      address_id,
      total: 0, // will be recalculated
    }], { session });
    const orderId = order[0]._id;

    // Create order items (snapshot current product price)
    const orderItemsDocs = cartItems.map(ci => {
      const p = productMap.get(String(ci.product_id));
      return {
        order_id: orderId,
        product_id: ci.product_id,
        variant_id: ci.variant_id || null,
        quantity: ci.quantity,
        price: p.price, // snapshot at time of purchase
      };
    });
    await OrderItem.insertMany(orderItemsDocs, { session });

    // Decrement product stock
    for (const ci of cartItems) {
      const p = productMap.get(String(ci.product_id));
      await Product.updateOne(
        { _id: p._id },
        { $inc: { stock: -ci.quantity } },
        { session }
      );
    }

    // Clear cart items
    await CartItem.deleteMany({ cart_id: cart._id }).session(session);

    // Recalc total
    const total = await recalcOrderTotal(orderId, session);

    await session.commitTransaction();
    session.endSession();

    const populated = await Order.findById(orderId)
      .populate("user_id", "name email")
      .populate("address_id")
      .lean();

    const items = await OrderItem.find({ order_id: orderId }).populate("product_id").lean();

    return res.status(201).json({
      message: "Order placed successfully from cart",
      order: { ...populated, total },
      items,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: err.message || "Failed to place order" });
  }
};

/**
 * GET /api/orders/:orderId
 * - Fetch single order with items
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user_id", "name email")
      .populate("address_id")
      .lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    const items = await OrderItem.find({ order_id: orderId })
      .populate("product_id")
      .lean();

    return res.json({ order, items });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to fetch order" });
  }
};

/**
 * GET /api/orders/user/:userId
 * - Fetch user's order history (orders + items)
 */
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user_id: userId })
      .sort({ _id: -1 })
      .lean();

    const orderIds = orders.map(o => o._id);
    const items = await OrderItem.find({ order_id: { $in: orderIds } })
      .populate("product_id")
      .lean();

    const itemsByOrder = items.reduce((acc, it) => {
      const k = String(it.order_id);
      (acc[k] ||= []).push(it);
      return acc;
    }, {});

    const result = orders.map(o => ({
      order: o,
      items: itemsByOrder[String(o._id)] || [],
    }));

    return res.json({ count: result.length, orders: result });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to fetch user orders" });
  }
};

/**
 * POST /api/orders/:orderId/items
 * Body: { product_id, quantity, variant_id? }
 * - Add an item to an existing order (assumes "pending"/editable order concept)
 * - Adjust product stock accordingly
 */
export const addOrderItem = async (req, res) => {
  const { orderId } = req.params;
  const { product_id, quantity, variant_id } = req.body;

  if (!product_id || !quantity) {
    return res.status(400).json({ message: "product_id and quantity are required" });
  }
  if (quantity <= 0) {
    return res.status(400).json({ message: "quantity must be > 0" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error("Order not found");

    const product = await Product.findById(product_id).session(session);
    if (!product) throw new Error("Product not found");
    if (product.stock < quantity) throw new Error(`Insufficient stock for "${product.name}"`);

    // Create or merge with existing same product/variant line
    let existing = await OrderItem.findOne({
      order_id: orderId,
      product_id,
      variant_id: variant_id || null,
    }).session(session);

    if (existing) {
      existing.quantity += quantity;
      await existing.save({ session });
    } else {
      await OrderItem.create([{
        order_id: orderId,
        product_id,
        variant_id: variant_id || null,
        quantity,
        price: product.price,
      }], { session });
    }

    await Product.updateOne({ _id: product_id }, { $inc: { stock: -quantity } }).session(session);

    const total = await recalcOrderTotal(orderId, session);

    await session.commitTransaction();
    session.endSession();

    const updatedItems = await OrderItem.find({ order_id: orderId }).populate("product_id");
    return res.status(201).json({ message: "Item added to order", total, items: updatedItems });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: err.message || "Failed to add item" });
  }
};

/**
 * PATCH /api/orders/:orderId/items/:orderItemId
 * Body: { quantity }
 * - Update quantity of an order item
 * - Adjust product stock delta
 */
export const updateOrderItemQty = async (req, res) => {
  const { orderId, orderItemId } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== "number") {
    return res.status(400).json({ message: "quantity is required as number" });
  }
  if (quantity <= 0) {
    return res.status(400).json({ message: "quantity must be > 0" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const item = await OrderItem.findOne({ _id: orderItemId, order_id: orderId }).session(session);
    if (!item) throw new Error("Order item not found");

    const product = await Product.findById(item.product_id).session(session);
    if (!product) throw new Error("Product not found");

    const delta = quantity - item.quantity;
    if (delta > 0 && product.stock < delta) {
      throw new Error(`Insufficient stock to increase quantity (need ${delta}, have ${product.stock})`);
    }

    item.quantity = quantity;
    await item.save({ session });

    // Adjust stock (negative delta -> return stock)
    await Product.updateOne(
      { _id: item.product_id },
      { $inc: { stock: -delta } },
      { session }
    );

    const total = await recalcOrderTotal(orderId, session);

    await session.commitTransaction();
    session.endSession();

    const items = await OrderItem.find({ order_id: orderId }).populate("product_id");
    return res.json({ message: "Order item updated", total, items });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: err.message || "Failed to update order item" });
  }
};

/**
 * DELETE /api/orders/:orderId/items/:orderItemId
 * - Remove an item from the order
 * - Restore product stock
 */
export const removeOrderItem = async (req, res) => {
  const { orderId, orderItemId } = req.params;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const item = await OrderItem.findOne({ _id: orderItemId, order_id: orderId }).session(session);
    if (!item) throw new Error("Order item not found");

    await Product.updateOne(
      { _id: item.product_id },
      { $inc: { stock: item.quantity } },
      { session }
    );

    await OrderItem.deleteOne({ _id: item._id }).session(session);

    const total = await recalcOrderTotal(orderId, session);

    await session.commitTransaction();
    session.endSession();

    const items = await OrderItem.find({ order_id: orderId }).populate("product_id");
    return res.json({ message: "Order item removed", total, items });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: err.message || "Failed to remove order item" });
  }
};

/**
 * POST /api/orders/:orderId/recalculate
 * - Force recalc total (safety/debug endpoint)
 */
export const recalcTotalEndpoint = async (req, res) => {
  const { orderId } = req.params;
  try {
    const total = await recalcOrderTotal(orderId);
    return res.json({ message: "Total recalculated", total });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to recalc total" });
  }
};
