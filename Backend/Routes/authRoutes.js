const express = require("express");
const { registerUser, loginUser, getProfile } = require("../authController");
const { protect } = require("../authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

module.exports = router;
