import express from "express";
import { createAddress,getUserAddresses, updateAddress, deleteAddress} from "../Controllers/addressController.js";

const router = express.Router();

// POST /api/addresses
router.post("/", createAddress);
router.get("/:userId", getUserAddresses);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);


export default router;