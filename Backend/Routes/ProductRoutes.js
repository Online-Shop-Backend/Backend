const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("../Controllers/ProductController");

// Use memory storage so we can store bytes in MongoDB
const upload = multer({ storage: multer.memoryStorage() });

// CRUD routes
router.post("/", upload.single("image"), controller.createProduct);
router.get("/", controller.getProducts);
router.get("/:id", controller.getProductById);
router.get("/:id/image", controller.getProductImage);
router.put("/:id", upload.single("image"), controller.updateProduct);
router.delete("/:id", controller.deleteProduct);

module.exports = router;
