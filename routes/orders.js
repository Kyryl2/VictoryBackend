import express from "express";
import Order from "../models/Order.js";
import authmiddleware from "../middlewares/authmiddleware.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();
const transporter = nodemailer.createTransport({
  host: "smtp.ukr.net", // SMTP-сервер
  port: 465,
  secure: true, // true для 465, false для інших портів
  auth: {
    user: process.env.URK_NET_EMAIL, // Ваш email
    pass: process.env.URK_NET_PASSWORD, // Ваш пароль
  },
});

// Оформити замовлення
router.post("/checkout", authmiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      user: req.user._id,
      status: "Pending",
    });

    if (!order) {
      return res.status(400).json({ error: "No order found" });
    }

    // Зміна статусу замовлення на 'Completed'
    order.status = "Completed";
    await order.save();

    // Відправка електронного листа з деталями замовлення
    const mailOptions = {
      from: process.env.URK_NET_EMAIL,
      to: process.env.URK_NET_EMAIL,
      subject: "New Order Completed",
      text: `Order ID: ${order._id}\nTotal: ${
        order.total
      }\nProducts: ${order.products
        .map((p) => `${p.product.name} x ${p.quantity}`)
        .join(", ")}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send email" });
      } else {
        console.log("Email sent:", info.response);
      }
    });

    // Створення нового замовлення з порожнім кошиком для користувача
    const newOrder = new Order({
      user: req.user._id,
      products: [], // Очищаємо кошик
      total: 0,
      status: "Pending",
    });
    await newOrder.save();

    res.json({ order, message: "Order completed and cart cleared" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Додати товар до кошика
router.post("/cart", authmiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const order = await Order.findOne({ user: req.user._id, status: "Pending" });

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const productIndex = order.products.findIndex(
    (p) => p.product.toString() === productId
  );

  if (productIndex > -1) {
    order.products[productIndex].quantity += quantity;
  } else {
    order.products.push({ product: productId, quantity });
  }

  order.total = order.products.reduce(
    (total, p) => total + p.quantity * p.product.price,
    0
  );
  await order.save();

  res.json(order);
});

// Перегляд кошика
router.get("/cart", authmiddleware, async (req, res) => {
  const order = await Order.findOne({
    user: req.user._id,
    status: "Pending",
  }).populate("products.product");
  res.json(order);
});

// Видалити товар з кошика
router.delete("/cart/:productId", authmiddleware, async (req, res) => {
  const { productId } = req.params;
  const order = await Order.findOne({ user: req.user._id, status: "Pending" });

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const productIndex = order.products.findIndex(
    (p) => p.product.toString() === productId
  );

  if (productIndex > -1) {
    order.products.splice(productIndex, 1);
    order.total = order.products.reduce(
      (total, p) => total + p.quantity * p.product.price,
      0
    );
    await order.save();
    res.json(order);
  } else {
    res.status(404).json({ error: "Product not found in cart" });
  }
});

export default router;
