// Import necessary modules
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // Import your authentication middleware
const Document = require("../models/Document");
const { v4: uuidv4 } = require("uuid");

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

// Route to create a new document
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Create a new document with a UUID
    const newDocument = new Document({
      _id: uuidv4(),
      users: [req.userId], // Add the user ID of the creator
    });

    // Save the document to the database
    await newDocument.save();
    // Send the new document as a response
    res.status(201).json(newDocument);
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Failed to create document" });
  }
});

module.exports = router;
