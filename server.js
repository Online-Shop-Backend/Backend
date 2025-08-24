import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import FeedbackRoutes from "./Routes/FeedbackRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Fixed route path
app.use("/api/feedbacks", FeedbackRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Backend is running & MongoDB connected!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
