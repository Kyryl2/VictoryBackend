// const mongoose = require('mongoose');

// const ProductSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   category: { type: String, required: true }, // 'pizza', 'sushi', etc.
//   price: { type: Number, required: true },
//   description: { type: String },
//   image: { type: String }
// });

// const Product = mongoose.model('Product', ProductSchema);
// module.exports = Product;
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  // Інші поля
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
