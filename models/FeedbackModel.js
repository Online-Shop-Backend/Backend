import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    feedback_id: { type: String, required: true },
    product_id: { type: String, required: true },
    rating: { type: Number, required: true },
    review: { type: String, required: false, trim: true }
}, { timestamps: true });


const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;