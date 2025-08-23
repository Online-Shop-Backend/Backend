import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI not set in environment. Aborting seed.");
  process.exit(1);
}

console.log("Connecting to MongoDB...\n");
await mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// --- Schemas (match your existing model shapes) ---
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
  image_url: String,
  category_name: String,
  brand_name: String,
  color: String,
  size: String,
});

const cartSchema = new mongoose.Schema({ user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" } });

const cartItemSchema = new mongoose.Schema({
  cart_id: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  variant_id: String,
  quantity: Number,
  price_at_add: Number,
});

const addressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  line1: String,
  city: String,
  state_province: String,
  postal_code: String,
  country: String,
});

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  total: Number,
});

const orderItemSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  variant_id: String,
  quantity: Number,
  price: Number,
});

const paymentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  card_no: String,
  cvv: String,
  name_of_card: String,
  expiry: String,
});

const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  rating: Number,
  comment: String,
});

// --- Models ---
const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Cart = mongoose.model("Cart", cartSchema);
const CartItem = mongoose.model("CartItem", cartItemSchema);
const Address = mongoose.model("Address", addressSchema);
const Order = mongoose.model("Order", orderSchema);
const OrderItem = mongoose.model("OrderItem", orderItemSchema);
const Payment = mongoose.model("Payment", paymentSchema);
const CustomerFeedback = mongoose.model("CustomerFeedback", feedbackSchema);

async function runSeed() {
  try {
    console.log("Seeding sample documents...");

    // Clean-ish: only remove specific test email/products to avoid destructive drops
    await User.deleteMany({ email: /@example\.com$/i });
    await Product.deleteMany({ name: /Sample Product/i });

    const user = await User.create({
      name: "Seed User",
      email: "seed-user@example.com",
      phone: "1234567890",
      password: "password123",
    });

    const productA = await Product.create({
      name: "Sample Product A",
      description: "A sample product created by seed",
      price: 19.99,
      stock: 100,
      category_name: "General",
    });

    const productB = await Product.create({
      name: "Sample Product B",
      description: "Another sample product",
      price: 29.99,
      stock: 50,
      category_name: "General",
    });

    const cart = await Cart.create({ user_id: user._id });

    await CartItem.create({
      cart_id: cart._id,
      product_id: productA._id,
      quantity: 2,
      price_at_add: productA.price,
    });

    const address = await Address.create({
      user_id: user._id,
      line1: "123 Seed St",
      city: "Sample City",
      state_province: "State",
      postal_code: "00000",
      country: "Neverland",
    });

    const order = await Order.create({
      user_id: user._id,
      address_id: address._id,
      total: productA.price * 2,
    });

    await OrderItem.create({
      order_id: order._id,
      product_id: productA._id,
      quantity: 2,
      price: productA.price,
    });

    await Payment.create({
      order_id: order._id,
      card_no: "4242424242424242",
      cvv: "123",
      name_of_card: "Seed User",
      expiry: "12/30",
    });

    await CustomerFeedback.create({
      user_id: user._id,
      product_id: productA._id,
      rating: 5,
      comment: "Great product (seed)",
    });

    console.log("Seed complete. Inserted sample user and products.");
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runSeed();
