// server.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js"; // import app

dotenv.config();

const PORT = process.env.PORT || 5000;

// DB connect
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    // Start server only after DB connection
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
