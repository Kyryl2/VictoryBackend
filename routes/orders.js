import express from "express";
import Order from "../models/Order.js";
import authmiddleware from "../middlewares/authmiddleware.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Налаштування транспорту для надсилання електронних листів
const transporter = nodemailer.createTransport({
  host: "smtp.ukr.net", // SMTP-сервер
  port: 465,
  secure: true, // true для 465, false для інших портів
  auth: {
    user: "slavaukraine21@ukr.net", // Ваш email
    pass: "vsb6rZZ8Oaejmq93", // Ваш пароль
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
      from: "slavaukraine21@ukr.net",
      to: "slavaukraine21@ukr.net",
      subject: "New Order Completed",
      text: `Order ID: ${order._id}\nTotal: ${
        order.total
      }\nProducts: ${order.products
        .map((p) => `${p.name} x ${p.quantity}`)
        .join(", ")}`,
    };

    // Використання async/await для надсилання електронного листа
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return res.status(500).json({ error: "Failed to send email" });
    }

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
    console.error("Error processing checkout:", error);
    res.status(500).json({ error: "Server error" });
  }
});
// Додати товар до кошика
router.post("/cart", authmiddleware, async (req, res) => {
  try {
    // Деструктуризація даних з тіла запиту
    const { name, description, price, img, quantity } = req.body;

    // Знайти замовлення користувача зі статусом "Pending"
    let order = await Order.findOne({ user: req.user._id, status: "Pending" });

    // Якщо замовлення не знайдено, створюємо нове замовлення
    if (!order) {
      order = new Order({
        user: req.user._id,
        status: "Pending",
        products: [],
        total: 0,
      });
    }

    // Перевіряємо, чи продукт уже є в замовленні
    const productIndex = order.products.findIndex((p) => p.name === name);

    if (productIndex > -1) {
      // Якщо продукт уже є в замовленні, збільшуємо кількість
      order.products[productIndex].quantity += quantity; // або додайте логіку для зміни кількості
    } else {
      // Якщо продукт не знайдено, додаємо новий продукт
      order.products.push({
        name,
        description,
        price,
        img,
        quantity, // встановлюємо початкову кількість
      });
    }

    // Оновлюємо загальну суму замовлення
    order.total = order.products.reduce(
      (total, p) => total + p.quantity * p.price,
      0
    );

    // Зберігаємо замовлення
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
      (p) => p.name === productName
    );

    if (productIndex > -1) {
      order.products.splice(productIndex, 1);
      order.total = order.products.reduce(
        (total, p) => total + p.quantity * p.price,
        0
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
router.patch("/cart", authmiddleware, async (req, res) => {
  try {
    const { name, quantity } = req.body;

    // Find the order of the user with status "Pending"
    let order = await Order.findOne({ user: req.user._id, status: "Pending" });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the product by name
    const productIndex = order.products.findIndex(
      (product) => product.name === name
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    // Update the product quantity
    order.products[productIndex].quantity = quantity;
    // Оновлюємо загальну суму замовлення
    order.total = order.products.reduce(
      (total, product) => total + product.quantity * product.price,
      0
    );

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
