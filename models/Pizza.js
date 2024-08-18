import mongoose from "mongoose";

const PizzaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
});

const Pizza = mongoose.model("Pizza", PizzaSchema);
export default Pizza;
