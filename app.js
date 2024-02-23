const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3053",
    methods: ["GET", "POST"],
  },
});

// Store room data in memory (you might want to use a database in production)
const rooms = {};

io.on("connection", (socket) => {
  console.log("a user connected");

  // Join a room based on the provided room ID
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = ""; // Initialize an empty document for the room
    }
    io.to(roomId).emit("updateText", rooms[roomId]); // Send the current document to the newly joined user
  });

  socket.on("textChange", ({ roomId, newText }) => {
    rooms[roomId] = newText;
    io.to(roomId).emit("updateText", newText); // Broadcast the updated text to all users in the room
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
