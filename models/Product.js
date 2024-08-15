const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // 'pizza', 'sushi', etc.
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String }
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
