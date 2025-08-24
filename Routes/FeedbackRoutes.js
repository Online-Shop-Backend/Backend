import express from "express";
import {
    getAllFeedbacks,
    addFeedbacks,
    getById,
    updateFeedback,
    deleteFeedback,
    getAverageRating
} from "../Controllers/FeedbackControllers.js";

const router = express.Router();

router.get("/", getAllFeedbacks);
router.post("/", addFeedbacks);
router.get("/:id", getById);
router.put("/:id", updateFeedback);
router.delete("/:id", deleteFeedback);

//New route: get average rating by product
router.get("/average/:productId", getAverageRating);

export default router;