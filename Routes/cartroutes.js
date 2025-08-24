
const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const cartcontroller = require("../Controllers/cartcontroller");


router.post("/", cartController.createCart);


router.get("/user/:userId", cartController.getCartByUser);


router.delete("/:cartId", cartController.deleteCart);


router.post("/item", cartController.addItemToCart);


router.get("/:cartId/items", cartController.getCartItems);

module.exports = router;
