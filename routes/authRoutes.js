// Import necessary modules
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import User model

// Initialize router
const router = express.Router();
//
// Add middleware to parse JSON bodies
// router.use(express.json());

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username.length < 4 || password.length < 5) {
      return res.status(400).json({
        error: "Username or password is too short",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = await User.create({ username, password });
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);

    res.status(201).json({ token, userId: newUser._id });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
