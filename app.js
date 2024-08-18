import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import sushiRoutes from "./routes/sushi.js";
import pizzaRoutes from "./routes/pizza.js";
import cors from "cors";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
mongoose.connect(process.env.MONGO_URI);

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/sushi", sushiRoutes);
app.use("/pizza", pizzaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
