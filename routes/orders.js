import express from "express";
import Order from "../models/Order.js";
import authmiddleware from "../middlewares/authmiddleware.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Налаштування Gmail транспорту
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Ваш Gmail
    pass: process.env.EMAIL_PASS, // App Password (16 символів)
  },
});

// Перевірка з'єднання при запуску
transporter.verify((error) => {
  if (error) {
    console.error("❌ Gmail SMTP connection error:", error);
    console.log("Please check EMAIL_USER and EMAIL_PASS environment variables");
  } else {
    console.log("✅ Gmail SMTP is ready to send emails");
  }
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

    // Створення нового замовлення з порожнім кошиком
    const newOrder = new Order({
      user: req.user._id,
      products: [],
      total: 0,
      status: "Pending",
    });
    await newOrder.save();

    // Відправка електронного листа
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // або вкажіть інший email для отримання
      subject: "🛒 Нове замовлення оформлено",
      html: `
        <h2>Деталі замовлення</h2>
        <p><strong>ID замовлення:</strong> ${order._id}</p>
        <p><strong>Загальна сума:</strong> ${order.total} грн</p>
        <h3>Товари:</h3>
        <ul>
          ${order.products
            .map(
              (p) =>
                `<li>${p.name} - ${p.quantity} шт. × ${p.price} грн = ${
                  p.quantity * p.price
                } грн</li>`,
            )
            .join("")}
        </ul>
        <p><strong>Дата:</strong> ${new Date().toLocaleString("uk-UA")}</p>
      `,
    };

    // Відправка email в фоновому режимі
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("✅ Email sent successfully:", info.messageId);
      })
      .catch((emailError) => {
        console.error("❌ Email sending failed:", emailError.message);
        // Email не відправився, але замовлення оброблене
      });

    // Відповідаємо одразу, не чекаючи на email
    res.json({ order, message: "Order completed and cart cleared" });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Додати товар до кошика
router.post("/cart", authmiddleware, async (req, res) => {
  try {
    const { name, description, price, img, quantity } = req.body;

    let order = await Order.findOne({ user: req.user._id, status: "Pending" });

    if (!order) {
      order = new Order({
        user: req.user._id,
        status: "Pending",
        products: [],
        total: 0,
      });
    }

    const productIndex = order.products.findIndex((p) => p.name === name);

    if (productIndex > -1) {
      order.products[productIndex].quantity += quantity;
    } else {
      order.products.push({
        name,
        description,
        price,
        img,
        quantity,
      });
    }

    order.total = order.products.reduce(
      (total, p) => total + p.quantity * p.price,
      0,
    );

    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Перегляд кошика
router.get("/cart", authmiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      user: req.user._id,
      status: "Pending",
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Видалити товар з кошика
router.delete("/cart/:productName", authmiddleware, async (req, res) => {
  try {
    const { productName } = req.params;
    const order = await Order.findOne({
      user: req.user._id,
      status: "Pending",
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const productIndex = order.products.findIndex(
      (p) => p.name === productName,
    );

    if (productIndex > -1) {
      order.products.splice(productIndex, 1);
      order.total = order.products.reduce(
        (total, p) => total + p.quantity * p.price,
        0,
      );
      await order.save();
      res.json(order);
    } else {
      res.status(404).json({ error: "Product not found in cart" });
    }
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Оновити кількість товару в кошику
router.patch("/cart", authmiddleware, async (req, res) => {
  try {
    const { name, quantity } = req.body;

    let order = await Order.findOne({ user: req.user._id, status: "Pending" });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const productIndex = order.products.findIndex(
      (product) => product.name === name,
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    order.products[productIndex].quantity = quantity;
    order.total = order.products.reduce(
      (total, product) => total + product.quantity * product.price,
      0,
    );

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
