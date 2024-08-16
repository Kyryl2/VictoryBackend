const express = require('express');
const mongoose = require('mongoose');
const { mongoURI } = require('./config');
require('dotenv').config();
const cors = require('cors');
const User = require('./models/User');


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

  const { name, email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    throw new HttpError(409, 'Email already in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const verificationToken = nanoid(12);

  const newUser = await User.create({
    name,
    email,
    password: hashPassword,
    verificationToken,
  });



  res.json({
    status: 201,
    message: 'User successfully registered',
    data: {
      username: newUser.username,
      email: newUser.email,
    },
  });

    });
  // } catch (error) {
  //   console.error('Error during registration:', error.message);  // Логування помилки
  //   res.status(500).send('Server error');
  // }

// app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/products', require('./routes/products.js'));
app.use('/api/orders', require('./routes/orders.js'));
// app.post('/register', (req, res) => {
//     res.send('Registration endpoint');
//   });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
