const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

const router = express.Router();

// Реєстрація
// router.post('/register', async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     let user = await User.findUser({ email });
//     if (user) return res.status(400).json({ msg: 'User already exists' });

//     user = new User({ name, email, password });
//     await user.save();

//     const payload = { user: { id: user.id }};
//     jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
//       if (err) throw err;
//       res.json({ token });
//     });
//   } catch (err) {
//     res.status(500).send('Server error');
//   }
// });

router.post('/register', async (req, res, next) => {
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
// Логін
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id }};
    jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
