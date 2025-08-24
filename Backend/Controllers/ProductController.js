const mongoose = require("mongoose");
const Product = require("../Model/ProductModel");

// CREATE  (POST /api/products)
exports.createProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.stock !== undefined) data.stock = Number(data.stock);

    if (req.file) {
      data.image_data = req.file.buffer;
      data.image_mime = req.file.mimetype;
      data.image_name = req.file.originalname;
    }

    const created = await Product.create(data);
    res.status(201).json(created);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create product", error: err.message });
  }
};

// READ ALL  (GET /api/products)
exports.getProducts = async (_req, res) => {
  try {
    const items = await Product.find({}, { image_data: 0 }).sort("-createdAt");
    res.json(items);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
};

// READ ONE  (GET /api/products/:id)
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid product ID" });

    const doc = await Product.findById(id, { image_data: 0 });
    if (!doc) return res.status(404).json({ message: "Product not found" });
    res.json(doc);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: err.message });
  }
};

// READ IMAGE  (GET /api/products/:id/image)
exports.getProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid product ID" });

    const doc = await Product.findById(id, { image_data: 1, image_mime: 1 });
    if (!doc || !doc.image_data)
      return res.status(404).json({ message: "Image not found" });

    res.set("Content-Type", doc.image_mime || "application/octet-stream");
    res.send(doc.image_data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch image", error: err.message });
  }
};

// UPDATE  (PUT /api/products/:id)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid product ID" });

    const data = { ...req.body };
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.stock !== undefined) data.stock = Number(data.stock);

    if (req.file) {
      data.image_data = req.file.buffer;
      data.image_mime = req.file.mimetype;
      data.image_name = req.file.originalname;
    }

    const updated = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      projection: { image_data: 0 },
    });
    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update product", error: err.message });
  }
};

// DELETE  (DELETE /api/products/:id)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid product ID" });

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: err.message });
  }
};
