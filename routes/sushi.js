import express from "express";
import Sushi from "../models/Sushi.js";

const router = express.Router();

// Отримати список суші
router.get("/", async (req, res) => {
  const sushi = await Sushi.find();
  res.json(sushi);
});

// Додати нову суші
router.post("/", async (req, res) => {
  const { name, price, description } = req.body;
  const sushi = new Sushi({ name, price, description });
  await sushi.save();
  res.status(201).json(sushi);
});

export default router;
