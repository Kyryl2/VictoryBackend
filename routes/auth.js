import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();

    // eslint-disable-next-line no-undef
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User registered successfully", token });
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// Логін
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
});

// Logout
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// Оновлення токена (refresh user)
router.post("/refresh", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Генеруємо новий токен на основі існуючого
    const newToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({ token: newToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
