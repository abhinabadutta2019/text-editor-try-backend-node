const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Document = require("./Document.js"); // Assuming Document model for MongoDB

dotenv.config(); // Load environment variables

let uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.te788iv.mongodb.net/text-editor-try-feb-24?retryWrites=true&w=majority`;

async function connectToMongoDB() {
  try {
    await mongoose.connect(uri); // Connect to MongoDB
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectToMongoDB(); // Invoke MongoDB connection function

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3053", // Allow requests from this origin
    methods: ["GET", "POST"], // Allowed HTTP methods
  },
});

const rooms = {}; // Object to store room data

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("joinRoom", async (roomId) => {
    // Check if the roomId exists in the database
    let doc = await Document.findById(roomId);

    if (!doc) {
      // If roomId doesn't exist, create a new document in MongoDB
      doc = await Document.create({ _id: roomId, content: "" });
    }

    // Join the socket to the room
    socket.join(roomId);

    // Send the document content to the newly joined user
    io.to(roomId).emit("updateText", doc.content);
  });

  socket.on("textChange", async ({ roomId, newText }) => {
    // Update the document content in MongoDB
    await Document.findByIdAndUpdate(roomId, { content: newText });

    // Broadcast the updated text to all users in the room
    io.to(roomId).emit("updateText", newText);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
