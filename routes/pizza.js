import express from "express";
import Pizza from "../models/Pizza.js";

const router = express.Router();

// Отримати список піц
router.get("/", async (req, res) => {
  const pizzas = await Pizza.find();
  res.json(pizzas);
});

// Додати нову піцу
router.post("/", async (req, res) => {
  const { name, price, description } = req.body;
  const pizza = new Pizza({ name, price, description });
  await pizza.save();
  res.status(201).json(pizza);
});

export default router;
