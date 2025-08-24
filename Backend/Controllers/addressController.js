import Address from "../models/Address.js";

export const createAddress = async (req, res) => {
  try {
    const { userId, street, city, postalCode, country } = req.body;

    if (!userId || !street || !city || !postalCode || !country) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newAddress = new Address({
      userId,
      street,
      city,
      postalCode,
      country,
    });

    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Get addresses of a user
export const getUserAddresses = async (req, res) => {
    const { userId } = req.params;
    const addresses = await Address.find({ userId });
    res.status(200).json(addresses);
  };


  // Update address by ID
export const updateAddress = async (req, res) => {
    try {
      const { id } = req.params;
      const { street, city, postalCode, country } = req.body;
  
      const updatedAddress = await Address.findByIdAndUpdate(
        id,
        { street, city, postalCode, country },
        { new: true, runValidators: true } // return updated document and validate
      );
  
      if (!updatedAddress) {
        return res.status(404).json({ message: "Address not found" });
      }
  
      res.status(200).json(updatedAddress);
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };




  
// Delete address by ID
export const deleteAddress = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedAddress = await Address.findByIdAndDelete(id);
  
      if (!deletedAddress) {
        return res.status(404).json({ message: "Address not found" });
      }
  
      res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };