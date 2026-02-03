
// router.js
import express from "express";
import Order from "../models/Order.js";
import authmiddleware from "../middleware/authmiddleware.js";
import Resend from "resend";

const router = express.Router();

// Настройка Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Функция отправки письма
async function sendOrderEmail(to, order) {
  const productsList = order.products
    .map(p => ${p.name} — ${p.quantity} x ${p.price} грн)
    .join("\n");

  try {
    const data = await resend.emails.send({
      from: "slavaukraine21@ukr.net", // твоя украинская почта
      to,
      subject: Ваш заказ #${order._id},
      text: Спасибо за заказ!\n\nСостав заказа:\n${productsList}\n\nИтог: ${order.total} грн,
    });

    console.log("MAIL SENT", data);
  } catch (error) {
    console.error("MAIL ERROR", error);
  }
}

// ==========================
// PATCH /cart — обновление количества или удаление
// ==========================
router.patch("/cart", authmiddleware, async (req, res) => {
  try {
    const { name, quantity } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const order = await Order.findOne({
      user: req.user._id,
      status: "Pending",
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const productIndex = order.products.findIndex((p) => p.name === name);

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    if (quantity === 0) {
      // удаляем товар
      order.products.splice(productIndex, 1);
    } else if (quantity > 0) {
      // обновляем количество
      order.products[productIndex].quantity = quantity;
    } else {
      return res.status(400).json({ error: "Quantity must be 0 or greater" });
    }

    // пересчёт total
    order.total = order.products.reduce(
      (total, p) => total + p.quantity * p.price,
      0
    );

    await order.save();

    // отправляем письмо пользователю
    await sendOrderEmail(req.user.email, order);

    res.json(order);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// DELETE /cart/:productName — удаление товара (если нужно отдельное удаление)
// ==========================
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

    const productIndex = order.products.findIndex((p) => p.name === productName);

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    order.products.splice(productIndex, 1);
    order.total = order.products.reduce((total, p) => total + p.quantity * p.price, 0);

    await order.save();

    // отправляем письмо с обновлением заказа
    await sendOrderEmail(req.user.email, order);

    res.json(order);
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;