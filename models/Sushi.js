import mongoose from "mongoose";

const SushiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
});

const Sushi = mongoose.model("Sushi", SushiSchema);
export default Sushi;
