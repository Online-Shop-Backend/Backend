// routes/order.routes.js
import { Router } from "express";
import {
  placeOrderFromCart,
  getOrderById,
  getUserOrders,
  addOrderItem,
  updateOrderItemQty,
  removeOrderItem,
  recalcTotalEndpoint,
} from "../controllers/order.controller.js";

const router = Router();

// Place an order from the user's cart
router.post("/from-cart", placeOrderFromCart);

// Fetch single order (with items)
router.get("/:orderId", getOrderById);

// User's order history
router.get("/user/:userId", getUserOrders);

// Manage order items
router.post("/:orderId/items", addOrderItem);
router.patch("/:orderId/items/:orderItemId", updateOrderItemQty);
router.delete("/:orderId/items/:orderItemId", removeOrderItem);

// Debug/safety: recalc
router.post("/:orderId/recalculate", recalcTotalEndpoint);

export default router;













// // routes/order.routes.js
// import { Router } from "express";
// import { 
//   placeOrderFromCart,
//   getMyOrders,
//   getOrderById,
// } from "../Controllers/order.controller.js";

// const router = Router();

// // Place order from cart
// router.post("/checkout", placeOrderFromCart);

// // Current user's orders
// router.get("/my", getMyOrders);

// // Single order
// router.get("/:orderId", getOrderById);

// export default router;
