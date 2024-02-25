// Import necessary modules
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Document = require("./models/Document.js");
const authRoutes = require("./routes/authRoutes.js");
const documentRoutes = require("./routes/documentRoutes.js");

// Load environment variables
dotenv.config();
//
app.use(express.json());
app.use(cors());
//

// MongoDB connection URI
let uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.te788iv.mongodb.net/text-editor-try-feb-24?retryWrites=true&w=majority`;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
connectToMongoDB();

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3053",
    methods: ["GET", "POST"],
  },
});

// Object to store room data
const rooms = {};

io.on("connection", (socket) => {
  console.log("a user connected");

  // Join a room and update user list
  socket.on("joinRoom", async (roomId, userId) => {
    try {
      let doc = await Document.findById(roomId);
      if (!doc) {
        // If the document doesn't exist, create a new one
        doc = await Document.create({
          _id: roomId,
          content: "",
          users: [userId], // Add the user ID to the users array
        });
      } else {
        // If the document exists, proceed with normal operations
        if (!doc.users || !doc.users.includes(userId)) {
          // If the users array doesn't exist or the user is not included, update it
          doc.users = doc.users || [];
          doc.users.push(userId);
          await doc.save();
        }
      }
      socket.join(roomId);
      io.to(roomId).emit("updateText", doc.content);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  });

  // Handle text changes and update user list
  socket.on("textChange", async ({ roomId, newText, userId }) => {
    try {
      await Document.findByIdAndUpdate(roomId, { content: newText });
      let doc = await Document.findById(roomId);
      if (!doc.users.includes(userId)) {
        doc.users.push(userId);
        await doc.save();
      }
      io.to(roomId).emit("updateText", newText);
    } catch (error) {
      console.error("Error handling text change:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Start the server
const PORT = 3003;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// // User authentication routes (not implemented)
// app.post("/signup", (req, res) => {
//   // Signup logic
// });

// app.post("/login", (req, res) => {
//   // Login logic
// });

// Import user authentication routes

// Use user authentication routes
app.use("/auth", authRoutes);
app.use("/documents", documentRoutes);
