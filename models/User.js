import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);
export default User;
