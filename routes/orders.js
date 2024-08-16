import express from 'express';
import Order from '../models/Order.js';
 import authmiddleware from '../middlewares/authmiddleware.js';
const router = express.Router();

// Додати товар до кошика
router.post('/cart', authmiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const order = await Order.findOne({ user: req.user._id, status: 'Pending' });
  const productIndex = order.products.findIndex(p => p.product.toString() === productId);

  if (productIndex > -1) {
    order.products[productIndex].quantity += quantity;
  } else {
    order.products.push({ product: productId, quantity });
  }

  order.total = order.products.reduce((total, p) => total + p.quantity * p.product.price, 0);
  await order.save();

  res.json(order);
});

// Перегляд кошика
router.get('/cart', authmiddleware, async (req, res) => {
  const order = await Order.findOne({ user: req.user._id, status: 'Pending' }).populate('products.product');
  res.json(order);
});

// Оформити замовлення
router.post('/checkout', authmiddleware, async (req, res) => {
  const order = await Order.findOne({ user: req.user._id, status: 'Pending' });
  if (!order) return res.status(400).json({ error: 'No order found' });

  order.status = 'Completed';
  await order.save();
  res.json(order);
});

export default router;