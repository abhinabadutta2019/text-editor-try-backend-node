const mongoose = require("mongoose");

// Define the schema for the document
const documentSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // RoomId will be the document ID
  content: { type: String, default: "" }, // Content of the document
  users: { type: [String], default: [] }, // Array of user IDs who joined the room
});

// Create and export the Document model
module.exports = mongoose.model("Document", documentSchema);
