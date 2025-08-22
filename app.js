// app.js
import express from "express";
import orderRoutes from "./routes/order.routes.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/orders", orderRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

export default app;
