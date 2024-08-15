const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// Отримати всі продукти
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
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
