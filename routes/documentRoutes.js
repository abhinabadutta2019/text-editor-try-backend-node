// Import necessary modules
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // Import your authentication middleware
const Document = require("../models/Document");

// Route to fetch all documents of a specific user
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Retrieve the authenticated user's ID from the request object
    const userId = req.userId;

    // Find all documents associated with the user
    const documents = await Document.find({ users: { $in: [userId] } });

    // Send the documents as a response
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

module.exports = router;
