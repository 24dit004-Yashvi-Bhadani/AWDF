const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authi");
const {
  validateRegister,
  validateLogin,
} = require("../middleware/validateInput");

const router = express.Router();

router.post("/register", validateRegister, async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ status: 409, message: "Email already registered" });
    }

    const password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      name: req.body.name.trim(),
      email,
      password,
    });

    return res.status(201).json({
      status: 201,
      message: "Registration successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch {
    return res.status(500).json({ status: 500, message: "Registration failed" });
  }
});

router.post("/login", validateLogin, async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ status: 401, message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ status: 500, message: "Authentication is not configured" });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      status: 200,
      message: "Login successful",
      token,
    });
  } catch {
    return res.status(500).json({ status: 500, message: "Login failed" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    return res.json({ status: 200, user });
  } catch {
    return res.status(500).json({ status: 500, message: "Could not retrieve user" });
  }
});

module.exports = router;