const express = require('express');
const Order = require('../models/Order');
const auth = require('../middlewares/authmiddleware.js');

const router = express.Router();

// Створити нове замовлення
router.post('/', auth, async (req, res) => {
  const { products, total } = req.body;

  try {
    const newOrder = new Order({
      user: req.user.id,
      products,
      total
    });

    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Отримати всі замовлення користувача
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('products.product');
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
