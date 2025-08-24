import Feedback from "../models/Feedback.js";

// Get all Feedbacks
export const getAllFeedbacks = async (req, res, next) => {
    let feedbacks;
    try {
        feedbacks = await Feedback.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
    if (!feedbacks || feedbacks.length === 0) {
        return res.status(404).json({ message: "Feedback Not Found" });
    }
    return res.status(200).json({ feedbacks });
};

// Data Insert
export const addFeedbacks = async (req, res, next) => {
    const { feedback_id, product_id, rating } = req.body;
    let feedback;
    try {
        feedback = new Feedback({ feedback_id, product_id, rating });
        await feedback.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
    if (!feedback) {
        return res.status(400).json({ message: "Unable to add feedback" });
    }
    return res.status(201).json({ feedback });
};

// Get by ID 
export const getById = async (req, res, next) => {
    const id = req.params.id;
    let feedback;
    try {
        feedback = await Feedback.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
    if (!feedback) {
        return res.status(404).json({ message: "Feedback Not Found" });
    }
    return res.status(200).json({ feedback });
};

// Update Feedback Details
export const updateFeedback = async (req, res, next) => {
    const id = req.params.id;
    const { feedback_id, product_id, rating } = req.body;
    let feedback;
    try {
        feedback = await Feedback.findByIdAndUpdate(
            id,
            { feedback_id, product_id, rating },
            { new: true }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
    if (!feedback) {
        return res.status(404).json({ message: "Unable to Update Feedback Details" });
    }
    return res.status(200).json({ feedback });
};

// Delete Feedback Details
export const deleteFeedback = async (req, res, next) => {
    const id = req.params.id;
    let feedback;
    try {
        feedback = await Feedback.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
    if (!feedback) {
        return res.status(404).json({ message: "Unable to Delete Feedback Details" });
    }
    return res.status(200).json({ message: "Feedback deleted successfully" });
};

//Insert Feedback (with review)
export const addFeedbacksWithReview = async (req, res, next) => {
    const { feedback_id, product_id, rating, review } = req.body;
    let feedback;
    try {
        feedback = new Feedback({ feedback_id, product_id, rating, review });
        await feedback.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
    if (!feedback) {
        return res.status(400).json({ message: "Unable to add feedback" });
    }
    return res.status(201).json({ feedback });
};

//Get Average Rating by Product
export const getAverageRating = async (req, res, next) => {
    const { productId } = req.params;
    try {
        const result = await Feedback.aggregate([
            { $match: { product_id: productId } },
            {
                $group: {
                    _id: "$product_id",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (result.length === 0) {
            return res.status(404).json({ message: "No feedback found for this product" });
        }

        return res.status(200).json({
            product_id: productId,
            averageRating: result[0].averageRating.toFixed(1),
            totalReviews: result[0].totalReviews
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
};