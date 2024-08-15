const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// Отримати всі продукти
router.get('/', async (req, res) => {
  try {
    console.log("Fetching products...");
    const products = await Product.find();
    console.log("Products fetched:", products);
    res.json(products);
  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).send('Server errorrr');
  }
});

// Створити новий продукт (адмін-роль)
router.post('/', async (req, res) => {
  const { name, category, price, description, image } = req.body;

  try {
    const newProduct = new Product({ name, category, price, description, image });
    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
