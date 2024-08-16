const express = require('express');
const mongoose = require('mongoose');
const { mongoURI } = require('./config');
require('dotenv').config();
const cors = require('cors');


const app = express();
app.use(cors());

// Підключення до MongoDB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log(err));
  mongoose.connect("mongodb+srv://user_21:kirill1999@cluster0.83y84hi.mongodb.net/test?retryWrites=true&w=majority")
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Middleware

app.use(express.json());

// Роутинг
app.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword, name });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,  // Залиште або видаліть це, залежно від схеми
      },
    });
  } catch (error) {
    console.error('Error during registration:', error.message);  // Логування помилки
    res.status(500).send('Server error');
  }
});
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/products', require('./routes/products.js'));
app.use('/api/orders', require('./routes/orders.js'));
// app.post('/register', (req, res) => {
//     res.send('Registration endpoint');
//   });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
