import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Отримати список товарів
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Додати новий товар (адміністративний маршрут)
router.post('/', async (req, res) => {
  const { name, price, description } = req.body;
  const product = new Product({ name, price, description });
  await product.save();
  res.status(201).json(product);
});

export default router;